import { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../Table/Table';
import LineChart from '../LineChart/LineChart';
import LineChartRanged from '../LineChartRanged/LineChartRanged';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';

export default function User({ data, setData, defValLastIndex, setDefValLastIndex, tableRef }) {
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);
	const [isLoadingTable, setIsLoadingTable] = useState(false);

	useEffect(() => {
		if (data.length === 0) {
			// http://127.0.0.1:8000/api/v1/forecast/
			axios
				.get('http://35.89.128.109:8000/api/v1/forecast/')
				.then((response) => {
					setData(response.data);
					setDefValLastIndex(response.data.actual.cases.length - 1);
				})
				.catch((error) => {
					setData(null);
				});
		}
	}, []);

	if (data === null) return <Error />;
	if (data.length === 0) return <Loading />;

	return (
		<>
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
						<div className="md:w-2/4">
							<BarChart datasets={[data.forecast]} colors={['#e7625f']} title={'12-Month Forecast'} />
						</div>
						<div className="relative md:w-2/4">
							<LineChartRanged initialTitle={'Actual Values'} dataset={data.actual} color={'blue'} />
						</div>
					</div>
				</div>
			</div>
			<div className="relative w-full h-fit">
				<Table
					dataset={data.raw}
					skips={data.skips}
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
