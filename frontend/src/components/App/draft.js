import './App.css';
import Table from '../Table/Table';
import LoginForm from '../LoginForm/LoginForm';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';
import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Helmet } from 'react-helmet';

function App() {
	const [data, setData] = useState([]);
	const [editedData, setEditedData] = useState([]);
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);
	const [isLoadingTable, setIsLoadingTable] = useState(false);
	const [cookies, setCookie, removeCookie] = useCookies(['token']);
	const [defValLastIndex, setDefValLastIndex] = useState(null);
	const location = useLocation();

	const dataUser = useRef(null);
	const dataAdmin = useRef(null);

	useEffect(() => {
		setEditedData(data);
	}, [data]);

	useEffect(() => {
		axios
			// .get('http://35.93.57.77:8000/api/v1/forecast/')
			.get('http://35.89.128.109:8000/api/v1/forecast/')
			.then((response) => {
				const actualCasesLen = response.data.actual.cases.length;
				setData(response.data);
				setEditedData(response.data);
				setDefValLastIndex(actualCasesLen - 1);
			})
			.catch((error) => {
				setData(null);
			});
	}, []);

	function handleOnLogout(e) {
		if (window.confirm('You are about to logout as admin. Continue?')) {
			axios
				.post(
					// 'http://35.93.57.77:8000/api/dj-rest-auth/logout/',
					'http://127.0.0.1:8000/api/dj-rest-auth/logout/',
					{},
					{
						headers: {
							Authorization: `Token ${cookies.token}`,
						},
					}
				)
				.then((response) => {
					console.log('success', response);
					removeCookie('token');
				})
				.catch((error) => {
					console.log('error:', error);
				});
		}
	}

	function render(type) {
		if (data === null) return <Error />;
		if (data.length === 0) return <Loading />;

		switch (type) {
			case 'admin':
				if (cookies.token)
					return (
						<div className="relative w-full h-fit">
							{isLoadingCharts && <Loading />}
							<div className={`mb-10 ${isLoadingCharts ? `opacity-50` : ''}`}>
								<div className="w-full md:flex gap-8">
									<div className="md:w-2/4">
										<LineChart
											datasets={[editedData.processed, editedData.validation]}
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
														{editedData.performanceMeasures.mae}
													</span>
												</div>
												<div className="flex flex-col-reverse sm:flex-col">
													<span className="text-xs text-center sm:text-left text-rose-600 font-bold">RMSE</span>
													<span className="text-[2.25rem] md:text-[1.7em] lg:text-4xl xl:text-5xl text-blue-700">
														{editedData.performanceMeasures.mse}
													</span>
												</div>
												<div className="flex flex-col-reverse sm:flex-col">
													<span className="text-xs text-center sm:text-left text-rose-600 font-bold">MAPE</span>
													<span className="text-[2.25rem] md:text-[1.7em] lg:text-4xl xl:text-5xl text-blue-700">
														{editedData.performanceMeasures.mape}%
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="md:flex gap-8">
									<div className="md:w-2/4">
										<BarChart
											datasets={[editedData.forecast, editedData.forecast]}
											colors={['#1d4ed8', '#e11d48']}
											title={'Actual Values vs Validation'}
										/>
									</div>
									<div className="md:w-2/4">
										<LineChart datasets={[editedData.residuals]} colors={['#e11d48']} title={'Residuals'} />
									</div>
								</div>
							</div>
							<div className={isLoadingTable ? `opacity-50 pointer-events-none` : ''}>
								{isLoadingTable && <Loading />}
								<Table
									dataset={data.actual}
									setData={setData}
									dataAdmin={dataAdmin}
									defValLastIndex={defValLastIndex}
									setDefValLastIndex={setDefValLastIndex}
									isAdmin={true}
									cookies={cookies}
									setIsLoadingCharts={setIsLoadingCharts}
									setIsLoadingTable={setIsLoadingTable}
								/>
							</div>
						</div>
					);
				return <LoginForm cookies={cookies} setCookie={setCookie} />;
			default:
				return (
					<>
						<div className="relative w-full h-fit">
							{isLoadingCharts && <Loading />}
							<div className={isLoadingCharts ? `opacity-50` : ''}>
								<div className="mb-6 h-72 md:h-80 lg:h-96">
									<LineChart
										datasets={[editedData.processed, editedData.forecast]}
										colors={['#1d4ed8', '#1d4ed8']}
										title={'Actual Values and Forecasted Values'}
										maintainAspectRatio={false}
										indexDashLine={1}
									/>
								</div>
								<div className="relative mb-10 md:flex gap-4">
									<div className="md:w-2/4">
										<BarChart
											datasets={[editedData.forecast]}
											colors={['#1d4ed8', '#e11d48']}
											title={'12-Month Forecast'}
										/>
									</div>
									<div className="relative md:w-2/4">
										<LineChart
											datasets={[editedData.processed]}
											colors={['#1d4ed8']}
											title={'Actual Values'}
											hasRange={true}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="relative w-full h-fit">
							{isLoadingTable && <Loading />}
							<div className={isLoadingTable ? `opacity-50 pointer-events-none` : ''}>
								<Table
									dataset={editedData.actual}
									setData={setEditedData}
									dataUser={dataUser}
									setIsLoadingCharts={setIsLoadingCharts}
									setIsLoadingTable={setIsLoadingTable}
									defValLastIndex={defValLastIndex}
									setDefValLastIndex={setDefValLastIndex}
								/>
							</div>
						</div>
					</>
				);
		}
	}

	return (
		<>
			<Helmet>
				{location.pathname.indexOf('/admin') !== 0 ? (
					<title>Dashboard | HIV Forecasting PH</title>
				) : (
					<title>Admin | HIV Forecasting PH</title>
				)}
			</Helmet>

			<div className="my-5 w-full">
				<div className="w-[96%] mx-auto">
					<div className="w-full max-w-[1280px] mx-auto">
						<header className="mb-7 flex justify-between items-center">
							<Link to="/" className="h-fit text-black no-underline">
								<h1 className="h-fit text-4xl font-bold">
									<span className="text-rose-500">HIV</span>Forecasting
								</h1>
							</Link>

							{cookies.token && (
								<div className="flex gap-4">
									{location.pathname.indexOf('/admin') !== 0 && (
										<Link to="/admin" className="text-sm no-underline font-bold text-slate-500">
											Admin
										</Link>
									)}

									<button className="text-sm font-bold text-red-400 border-0 bg-inherit" onClick={handleOnLogout}>
										Logout
									</button>
								</div>
							)}
						</header>
						<main>
							<Routes>
								<Route path="/" element={render()} />
								<Route path="/admin" element={render('admin')} />
							</Routes>
						</main>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
