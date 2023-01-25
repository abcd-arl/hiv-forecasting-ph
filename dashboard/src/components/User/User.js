import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Table from '../Table/Table';
import LineChart from '../LineChart/LineChart';
import LineChartRanged from '../LineChartRanged/LineChartRanged';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';
import { ActionIcon } from '@mantine/core';
import { IconTableAlias } from '@tabler/icons';

export default function User({ data, setData, defValLastIndex, setDefValLastIndex, tableRef }) {
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);
	const [isLoadingTable, setIsLoadingTable] = useState(false);
	const [skips, setSkips] = useState({
		initialDates: [],
		finalDates: [],
	});
	const [forecastingMethodInput, setForecastingMethodInput] = useState(null);

	useEffect(() => {
		if (data.length === 0) {
			axios
				.get('http://35.93.57.77:8000/api/v1/forecast/')
				.then((response) => {
					setSkips({
						initialDates: structuredClone(response.data.skips),
						finalDates: structuredClone(response.data.skips),
					});
					setForecastingMethodInput(response.data.forecastingMethod);
					setData(response.data);
					setDefValLastIndex(response.data.actual.cases.length - 1);
				})
				.catch((error) => {
					console.log(error);
					setData(null);
				});
		}
	}, []);

	if (data === null) return <Error />;
	if (data.length === 0) return <Loading />;

	return (
		<>
			<a href="#table" className="absolute top-30 right-40">
				<ActionIcon variant="default" size="30px">
					<IconTableAlias size={16} />
				</ActionIcon>
			</a>
			<div className="relative w-full h-fit">
				{isLoadingCharts && <Loading />}
				<div className={isLoadingCharts ? `opacity-50` : ''}>
					<div className="mb-6 h-72 md:h-80 lg:h-96">
						<LineChart
							title={'Actual Values and Forecasted Values'}
							datasets={[data.actual, data.forecast]}
							colors={['blue', '#e7625f']}
							skips={data.skips}
							borderDashes={[false, [6, 5]]}
							timeUnit={'year'}
							isWide={true}
						/>
					</div>
					<div className="relative mb-10 md:flex gap-4">
						<div className="md:w-2/4 mt-12">
							<BarChart datasets={[data.forecast]} colors={['#e7625f']} title={'Forecast'} />
						</div>
						<div className="relative md:w-2/4">
							<LineChartRanged initialTitle={'Actual Values'} dataset={data.actual} color={'blue'} />
						</div>
					</div>
				</div>
			</div>
			<div id="table" className="relative w-full h-fit">
				<Table
					dataset={data.raw}
					forecastingMethodInput={forecastingMethodInput}
					setForecastingMethodInput={setForecastingMethodInput}
					skips={skips}
					setSkips={setSkips}
					setData={setData}
					tableRef={tableRef}
					defValLastIndex={defValLastIndex}
					setDefValLastIndex={setDefValLastIndex}
					setIsLoadingCharts={setIsLoadingCharts}
					setIsLoadingTable={setIsLoadingTable}
				/>
			</div>
		</>
	);
}

function getSkipDates(skips) {
	return skips.map((skip) => [
		new Date(skip.startDate[0], skip.startDate[1], 0),
		new Date(skip.startDate[0], skip.startDate[1] + skip.length - 1, 0),
	]);
}
