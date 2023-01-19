from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.core.files import File

import s3fs
import boto3
from io import StringIO 

import datetime
import pandas as pd
import numpy as np
import statsmodels.api as sm
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

from .models import Case

def remove_uwnanted_cases(series, start_date, skips):
    series_len = len(series)
    skip_indices = pd.Series([False] * series_len)
    skip_indices.index = pd.date_range(start=
                    pd.Period('{}-{}'.format(start_date[0], start_date[1]),freq='M').end_time.date(),
                    periods=series_len,
                    freq='M'
    )

    for skip in skips:
        skip_start_date = str(pd.Period('{}-{}'.format(skip["startDate"][0], skip["startDate"][1]),freq='M').end_time.date())
        start_loop = skip_indices.index.get_loc(skip_start_date)

        for i in range(start_loop, start_loop + skip["length"]):
            try:
                skip_indices[i] = True
            except IndexError:
                break

    wanted_series = [series[i] for i in range(len(series)) if not skip_indices[i]]
    index_to_start, index_to_end = 0, series_len - 1
    
    try:
        index_to_start = list(skip_indices.values).index(False)
    except ValueError:
        pass

    try:
        temp = list(skip_indices.values)
        temp.reverse()
        index_to_end = series_len - temp.index(False) - 1
    except ValueError:
        pass
    
    return skip_indices, wanted_series, index_to_start, index_to_end


def generate_forecast(series, skips=None):
    series_raw = series.copy()
    series_raw = series_raw.fillna('NaN')

    series_filled = series.copy()
    series_filled = series_filled.ffill()

    series_analysis = series_filled.copy()
    start_date = series.index[0]
    num_of_forecast = 12
    skip_indices = None
    last_index = len(series) - 1

    # drop cases in the series
    if (skips):
        (skip_indices, series_analysis, 
        first_index, last_index) = remove_uwnanted_cases(series, str(start_date).split("-"), skips)


    # generate training and testing data
    train = series_analysis[:len(series_analysis)-12]
    test = series_analysis[len(series_analysis)-12:]

    # fit model
    initial_model = None
    try:
        initial_model = sm.tsa.SARIMAX(train, order=(0,0,2), seasonal_order=(2,0,3,6)).fit()
    except: 
        initial_model = sm.tsa.SARIMAX(train, order=(0,0,2), seasonal_order=(2,0,3,6), enforce_stationarity=False).fit()
    final_model = sm.tsa.SARIMAX(series_analysis, order=(0,0,2), seasonal_order=(2,0,3,6), enforce_stationarity=False).fit()

    # predict
    predict = final_model.predict()

    print('test', test)

    # get validation, residuals
    validation = pd.Series(initial_model.forecast(len(test)))
    residuals = test - validation
    
    # get performance measeures
    # mae = mean_absolute_error(series_analysis, predict)
    # mse = mean_squared_error(series_analysis, predict, squared=False)
    # mape = mean_absolute_percentage_error(series_analysis, predict)

    # forecast
    forecast = pd.Series(final_model.forecast(len(series) - last_index + 12), name='Forecast')

    return {
        "raw": {
            "name": "Raw",
            "startDate": [series_raw.index[0].year, series_raw.index[0].month, series_raw.index[0].day],
            "cases": series_raw.tolist(),
        },
        "actual": {
            "name": "Actual",
            "startDate": [series_filled.index[0].year, series_filled.index[0].month, series_filled.index[0].day],
            "cases": series_filled.tolist(),
        },
        "predict": {
            "cases": final_model.predict()
        },
        "analysis": series_analysis,
        "validation" : {
            "name": "Validation",
            "startDate": [2019, 1],
            "cases": validation.tolist(),
        },
        "residuals": {
            "name": "Residuals",
            "startDate": [2019, 1],
            "cases": residuals.tolist()
        },
        "forecast": {
            "name": "Forecast",
            "startDate": [series.index[last_index].year, series.index[last_index].month + 1],
            "cases": forecast.tolist()
        },
        "performanceMeasures": {
            "mae": 1,
            "mse": 1,
            "mape": 1 
        }
    }

@api_view(['GET', 'POST'])
def forecast(request):
    # read data, convert to pd.Series, and add date index
    series = []
    skips = None
    if request.method == 'GET':
        recent_case = Case.objects.all().first()
        skips = recent_case.skips
        csv_file_path = recent_case.csv_file.url
        series = pd.read_csv(csv_file_path)
        series = series.iloc[:, 0]
        series.index = pd.date_range(start=recent_case.start_date, periods=len(series), freq='M')

    elif request.method == 'POST':
        series = pd.Series([int(value) if value else None for value in request.data['cases']], name='Cases')
        start_date = datetime.datetime.strptime("{}-{}-{}".format(request.data['startDate'][0], request.data['startDate'][1], request.data['startDate'][2]), '%Y-%m-%d').date()
        series.index = pd.date_range(start=start_date , periods=len(request.data['cases']), freq='M')
        # advised to get it from request
        recent_case = Case.objects.all().first()
        skips = recent_case.skips

    data = generate_forecast(series, skips)
    return Response({"raw": data["raw"], "actual": data["actual"], "forecast": data["forecast"], "skips": skips})

@api_view(['GET', 'POST'])
@permission_classes((IsAuthenticated, ))
def update_table(request):
    if request.method == 'POST':
        try:
            series = pd.Series([int(value) if value else None for value in request.data['cases']], name='Cases')
            start_date = datetime.datetime.strptime(request.data['startDate'], '%Y-%m-%d').date()

            bucket = "hiv-forecasting-ph-bucket"
            csv_buffer = StringIO()
            series.to_csv(csv_buffer, index=False)

            s3_resource = boto3.resource('s3')
            s3_resource.Object(bucket, 'series.csv').put(Body=csv_buffer.getvalue())
            s3_resource.Bucket(bucket).download_file('series.csv', 'static/series.csv')
            f = open('static/series.csv', "rb")
            myfile = File(f)

        except ValueError:
            return Response(status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        new_record = Case(start_date=start_date)
        new_record.csv_file.save("series.csv", myfile)
        new_record.save()

    # the same from GET method in forecast view
    recent_case = Case.objects.all().first()
    skips = recent_case.skips
    csv_file_path = recent_case.csv_file.url
    series = pd.read_csv(csv_file_path)
    series = series.iloc[:, 0]
    series.index = pd.date_range(start=recent_case.start_date, periods=len(series), freq='M')
    

    data = generate_forecast(series, skips)
    return Response({   "raw": data["raw"], 
                        "actual": data["actual"], 
                        "validation": data["validation"],
                        "forecast": data["forecast"],
                        "residuals": data["residuals"], 
                        "performanceMeasures": data["performanceMeasures"],
                        "skips": skips
                    })