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
	const [skips, setSkips] = useState({
		initialDates: [],
		finalDates: [],
	});

	useEffect(() => {
		if (Object.keys(data).length !== 0) {
			// get indices that are skipped
			const lastIndex = data.actual.cases.length - 1;
			const skipIndices = [...Array(lastIndex + 1)].map((e) => Array());
			data.skips.map((skip, idx) => {
				const actualStartDate = new Date(data.actual.startDate[0], data.actual.startDate[1], 0);
				const skipStartDate = new Date(skip.startDate[0], skip.startDate[1], 0);
				const startLoop = getMonthDifference([actualStartDate, skipStartDate]);

				for (let i = startLoop; i < startLoop + skip.length; i++) {
					if (i > lastIndex) break;
					skipIndices[i].push(idx);
				}
			});
		}
	}, [data]);

	useEffect(() => {
		if (data.length === 0 && cookies.token) {
			axios
				.get('http://127.0.0.1:8000/api/v1/update-table/', {
					headers: {
						Authorization: `Token ${cookies.token}`,
					},
				})
				.then((response) => {
					isFirstRun.current = false;
					setSkips({
						initialDates: structuredClone(response.data.skips),
						finalDates: structuredClone(response.data.skips),
					});
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

	console.log('skips', skips);

	return (
		<div className="relative w-full h-fit">
			{isLoadingCharts && <Loading />}
			{/* <div className={`mb-10 ${isLoadingCharts ? `opacity-50` : ''}`}> */}
			{/* <div className="mb-6 h-72 md:h-80 lg:h-96">
					<LineChart
						title={'Actual Values and Forecasted Values'}
						datasets={[data.actual, data.forecast]}
						skips={data.skips}
						colors={['blue', 'red']}
						borderDashes={[false, [6, 5]]}
						timeUnit={'year'}
						isWide={true}
					/>
				</div> */}
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
			{/* </div> */}
			<div className={isLoadingTable ? `opacity-50 pointer-events-none` : ''}>
				{isLoadingTable && <Loading />}
				<Table
					dataset={data.raw}
					skips={skips}
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

function getMonthDifference([startDate, endDate]) {
	return endDate.getMonth() - startDate.getMonth() + 12 * (endDate.getFullYear() - startDate.getFullYear());
}
