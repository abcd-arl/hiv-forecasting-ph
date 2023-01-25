import './App.css';
import axios from 'axios';
import User from '../User/User';
import Admin from '../Admin/Admin';
import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Helmet } from 'react-helmet';

function App() {
	const [defValLastIndex, setDefValLastIndex] = useState(null);
	const [cookies, setCookie, removeCookie] = useCookies(['token']);

	const [dataUser, setDataUser] = useState([]);
	const [dataAdmin, setDataAdmin] = useState([]);

	const tableUserRef = useRef(null);
	const tableAdminRef = useRef(null);

	const isAllowedDataUserRerender = useRef(false);
	const isAdminFirstRun = useRef(true);

	const location = useLocation();

	useEffect(() => {
		// to reload the homepage when 'dataAdmin' changes,
		// but not on first load of admin dashboard
		if (isAllowedDataUserRerender.current) {
			setDataUser([]);
			tableUserRef.current = null;
		} else if (!isAdminFirstRun.current) {
			isAllowedDataUserRerender.current = true;
		}
	}, [dataAdmin]);

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

									<button
										className="text-sm font-bold text-red-400 border-0 bg-inherit hover:cursor-pointer"
										onClick={handleOnLogout}
									>
										Logout
									</button>
								</div>
							)}
						</header>
						<main>
							<Routes>
								<Route
									path="/"
									element={
										<User
											data={dataUser}
											setData={setDataUser}
											defValLastIndex={defValLastIndex}
											setDefValLastIndex={setDefValLastIndex}
											tableRef={tableUserRef}
										/>
									}
								/>
								<Route
									path="/admin"
									element={
										<Admin
											data={dataAdmin}
											setData={setDataAdmin}
											defValLastIndex={defValLastIndex}
											setDefValLastIndex={setDefValLastIndex}
											tableRef={tableAdminRef}
											cookies={cookies}
											setCookie={setCookie}
											isFirstRun={isAdminFirstRun}
										/>
									}
								/>
							</Routes>
						</main>
					</div>
				</div>
			</div>
		</>
	);

	function handleOnLogout(e) {
		if (window.confirm('You are about to logout as admin. Continue?')) {
			axios
				.post(
					'http://35.93.57.77:8000/api/dj-rest-auth/logout/',
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
}

export default App;
