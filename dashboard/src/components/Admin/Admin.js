import { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../Table/Table';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';
import LoginForm from '../LoginForm/LoginForm';

export default function Admin({
	data,
	setData,
	defValLastIndex,
	setDefValLastIndex,
	tableRef,
	cookies,
	setCookie,
	isFirstRun,
}) {
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);
	const [isLoadingTable, setIsLoadingTable] = useState(false);

	useEffect(() => {
		console.log('data', data);
		console.log('cookies.token', cookies.token);

		if (data.length === 0 && cookies.token) {
			// .get('http://127.0.0.1:8000/api/v1/update-table/'

			axios
				.get('http://35.89.128.109:8000/api/v1/update-table/', {
					headers: {
						Authorization: `Token ${cookies.token}`,
					},
				})
				.then((response) => {
					isFirstRun.current = false;
					setData(response.data);
					setDefValLastIndex(response.data.actual.cases.length - 1);
				})
				.catch((error) => {
					console.log(error);
					setData(null);
				});
		}
	}, [cookies.token]);

	if (data === null) return <Error />;
	if (!cookies.token) return <LoginForm cookies={cookies} setCookie={setCookie} />;
	if (data.length === 0) return <Loading />;

	return (
		<div className="relative w-full h-fit">
			{isLoadingCharts && <Loading />}
			<div className={`mb-10 ${isLoadingCharts ? `opacity-50` : ''}`}>
				<div className="mb-6 h-72 md:h-80 lg:h-96">
					<LineChart
						title={'Actual Values and Forecasted Values'}
						datasets={[data.actual, data.validation]}
						colors={['blue', 'orange']}
						skips={data.skips}
						borderDashes={[false, [6, 5]]}
						timeUnit={'year'}
						isWide={true}
					/>
				</div>
				{/* <div className="md:flex gap-8">
					<div className="md:w-2/4">
						<BarChart
							datasets={[data.forecast, data.forecast]}
							colors={['#1d4ed8', '#e11d48']}
							title={'Actual Values vs Validation'}
						/>
					</div>
					<div className="md:w-2/4">
						<LineChart datasets={[data.residuals]} colors={['#e11d48']} title={'Residuals'} />
					</div>
				</div> */}
			</div>
			<div className={isLoadingTable ? `opacity-50 pointer-events-none` : ''}>
				{isLoadingTable && <Loading />}
				<Table
					dataset={data.raw}
					skips={data.skips}
					setData={setData}
					tableRef={tableRef}
					defValLastIndex={defValLastIndex}
					setDefValLastIndex={setDefValLastIndex}
					setIsLoadingCharts={setIsLoadingCharts}
					setIsLoadingTable={setIsLoadingTable}
					cookies={cookies}
					isAdmin={true}
				/>
			</div>
		</div>
	);
}
