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
			console.log('here');
			axios
				.get('http://127.0.0.1:8000/api/v1/update-table/', {
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
				<div className="w-full md:flex gap-8">
					<div className="md:w-2/4">
						<LineChart
							datasets={[data.actual, data.validation]}
							colors={['#1d4ed8', '#e11d48']}
							title={'Actual Values vs Validation'}
						/>
					</div>
					<div className="md:w-2/4 mb-10 md:mb-0 flex flex-col font-helvetica">
						<span className="mb-5 font-bold text-[12px] text-[#666] text-center relative top-3">
							Performance Measure
						</span>
						<div className="min-h-[170px] md:h-[80%] h-[100%] w-[90%] m-auto bg-40 bg-bottom bg-gradient-radial flex items-center">
							<div className="w-full flex flex-col sm:flex-row items-center gap-2 justify-between">
								<div className="flex flex-col-reverse sm:flex-col">
									<span className="text-xs text-center sm:text-left text-rose-600 font-bold">MAE</span>
									<span className="text-[2.25rem] md:text-[1.7em] lg:text-4xl xl:text-5xl text-blue-700">
										{data.performanceMeasures.mae}
									</span>
								</div>
								<div className="flex flex-col-reverse sm:flex-col">
									<span className="text-xs text-center sm:text-left text-rose-600 font-bold">RMSE</span>
									<span className="text-[2.25rem] md:text-[1.7em] lg:text-4xl xl:text-5xl text-blue-700">
										{data.performanceMeasures.mse}
									</span>
								</div>
								<div className="flex flex-col-reverse sm:flex-col">
									<span className="text-xs text-center sm:text-left text-rose-600 font-bold">MAPE</span>
									<span className="text-[2.25rem] md:text-[1.7em] lg:text-4xl xl:text-5xl text-blue-700">
										{data.performanceMeasures.mape}%
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="md:flex gap-8">
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
				</div>
			</div>
			<div className={isLoadingTable ? `opacity-50 pointer-events-none` : ''}>
				{isLoadingTable && <Loading />}
				<Table
					dataset={data.raw}
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
