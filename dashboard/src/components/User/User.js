import { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../Table/Table';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';

export default function User({ data, setData, defValLastIndex, setDefValLastIndex, tableRef }) {
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);

	useEffect(() => {
		if (data.length === 0) {
			axios
				.get('http://127.0.0.1:8000/api/v1/forecast/')
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
							datasets={[data.actual, data.forecast]}
							colors={['#1d4ed8', '#1d4ed8']}
							title={'Actual Values and Forecasted Values'}
							maintainAspectRatio={false}
							indexDashLine={1}
						/>
					</div>
					<div className="relative mb-10 md:flex gap-4">
						<div className="md:w-2/4">
							<BarChart datasets={[data.forecast]} colors={['#1d4ed8', '#e11d48']} title={'12-Month Forecast'} />
						</div>
						<div className="relative md:w-2/4">
							<LineChart datasets={[data.actual]} colors={['#1d4ed8']} title={'Actual Values'} hasRange={true} />
						</div>
					</div>
				</div>
			</div>
			<div className="relative w-full h-fit">
				<Table
					dataset={data.raw}
					setData={setData}
					tableRef={tableRef}
					defValLastIndex={defValLastIndex}
					setDefValLastIndex={setDefValLastIndex}
					setIsLoadingCharts={setIsLoadingCharts}
				/>
			</div>
		</>
	);
}
