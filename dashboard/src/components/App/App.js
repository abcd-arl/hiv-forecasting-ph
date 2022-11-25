import './App.css';
import Table from '../Table/Table';
import LoginForm from '../LoginForm/LoginForm';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import Error from '../Error/Error';
import Loading from '../Loading/Loading';
import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.min.css';

function App() {
	const [data, setData] = useState([]);
	const [editedData, setEditedData] = useState([]);
	const [isLoadingCharts, setIsLoadingCharts] = useState(false);
	const [cookies, setCookie, removeCookie] = useCookies(['token']);
	const [defValLastIndex, setDefValLastIndex] = useState(null);
	const location = useLocation();

	useEffect(() => {
		setEditedData(data);
	}, [data]);

	useEffect(() => {
		axios
			.get('https://hiv-forecasting-ph-api.herokuapp.com/api/v1/forecast/')
			.then((response) => {
				setData(response.data);
				setEditedData(response.data);
				setDefValLastIndex(response.data.actual.cases.length - 1);
			})
			.catch((error) => {
				console.log(error.message);
				setData(null);
			});
	}, []);

	function handleOnLogout(e) {
		if (window.confirm('You are about to logout as admin. Continue?')) {
			axios
				.post(
					'https://hiv-forecasting-ph-api.herokuapp.com/api/dj-rest-auth/logout/',
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
							<div className={isLoadingCharts ? `opacity-50 pointer-events-none` : ''}>
								<Table
									dataset={data.actual}
									setData={setData}
									defValLastIndex={defValLastIndex}
									setDefValLastIndex={setDefValLastIndex}
									isAdmin={true}
									cookies={cookies}
									setIsLoadingCharts={setIsLoadingCharts}
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
								<div className="mb-4 md:flex gap-4">
									<div className="md:w-2/4">
										<LineChart
											datasets={[editedData.actual, editedData.validation]}
											colors={['#1d4ed8', '#e11d48']}
											title={'Actual Values vs Model Forecasted Values'}
										/>
									</div>
									<div className="md:w-2/4 flex flex-col font-helvetica">
										<span className="mb-5 font-bold text-[11px] text-[#666] text-center relative top-3">
											Performance Measure
										</span>
										<div className="min-h-[170px] md:h-[80%] h-[100%] w-[90%] m-auto mr-[-.15rem] bg-40 bg-bottom bg-gradient-radial flex items-center">
											<div className="w-full flex flex-col sm:flex-row items-center gap-2 justify-between">
												<div className="flex flex-col-reverse sm:flex-col">
													<span className="text-xs text-center sm:text-left text-rose-600 font-bold">MAE</span>
													<span className="text-[2.5rem] md:text-2xl lg:text-4xl text-blue-700">
														{editedData.performanceMeasures.mae}
													</span>
												</div>
												<div className="flex flex-col-reverse sm:flex-col">
													<span className="text-xs text-center sm:text-left text-rose-600 font-bold">MSE</span>
													<span className="text-[2.5rem] md:text-2xl lg:text-4xl text-blue-700">
														{editedData.performanceMeasures.mse}
													</span>
												</div>
												<div className="flex flex-col-reverse sm:flex-col">
													<span className="text-xs text-center sm:text-left text-rose-600 font-bold">MAPE</span>
													<span className="text-[2.5rem] md:text-2xl lg:text-4xl text-blue-700">
														{editedData.performanceMeasures.mape}%
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="mb-10 md:flex gap-4">
									<div className="md:w-2/4">
										<BarChart dataset={editedData.forecast} title={'12-Month Forecast'} />
									</div>
									<div className="md:w-2/4">
										<LineChart datasets={[editedData.residuals]} colors={['#e11d48']} title={'Residuals'} />
									</div>
								</div>
							</div>
						</div>
						<Table
							dataset={editedData.actual}
							setData={setEditedData}
							setIsLoadingCharts={setIsLoadingCharts}
							defValLastIndex={defValLastIndex}
							setDefValLastIndex={setDefValLastIndex}
						/>
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

			<div className="my-10 w-full">
				<div className="w-[96%] mx-auto">
					<ReactNotifications />
					<div className="w-full max-w-[1050px] mx-auto">
						<header className="mb-10 flex justify-between items-end">
							<h1 className="text-4xl font-bold">
								<Link to="/">
									<span className="text-rose-500">HIV</span>Forecasting
								</Link>
							</h1>
							{cookies.token && (
								<div className="flex gap-4">
									{location.pathname.indexOf('/admin') !== 0 && (
										<Link to="/admin" className="text-sm font-bold text-slate-500">
											Admin
										</Link>
									)}

									<button className="text-sm font-bold text-red-400" onClick={handleOnLogout}>
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
