import { Formik, Field, Form, ErrorMessage } from 'formik';
import Loading from '../Loading/Loading';
import * as Yup from 'yup';
import axios from 'axios';
import { useState } from 'react';

export default function LoginForm({ cookies, setCookie }) {
	const [isIncorrect, setIsIncorrect] = useState(null);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	return (
		<div className="relative max-w-[90%] m-auto">
			{isLoggingIn && <Loading />}
			<div className={isLoggingIn ? `opacity-50` : ''}>
				<Formik
					initialValues={{ username: '', password: '' }}
					validationSchema={Yup.object({
						username: Yup.string().required('No username provided'),
						password: Yup.string().required('No password provided'),
					})}
					onSubmit={(values) => {
						setIsLoggingIn(true);
						axios
							// .post('http://35.93.57.77:8000/api/dj-rest-auth/login/', values)
							.post('http://127.0.0.1:8000/api/dj-rest-auth/login/', values)
							.then((response) => {
								setIsLoggingIn(false);
								setCookie('token', response.data.key, { path: '/', maxAge: 1000, secure: true, sameSite: 'strict' });
								window.setTimeout(() => {
									if (cookies['token']) alert('Your session has expired.');
								}, 3600000);
							})
							.catch((error) => {
								setIsIncorrect(true);
								setIsLoggingIn(false);
							});
					}}
				>
					<Form className="w-[75%] max-w-[400px] my-8 m-auto">
						<h1 className="w-fit mx-auto text-2xl">ADMIN</h1>
						<div className="m-auto w-full">
							<div className={`${isIncorrect ? 'block' : 'hidden'} text-[0.70rem] mb-2 text-red-500 font-bold`}>
								Incorrect username or password
							</div>
							<Field
								name="username"
								type="text"
								placeholder="Username"
								className="block w-full mb-1 py-[.65em] px-2 text-xs border border-solid boder-slate-200 bg-slate-100 rounded"
								disabled={isLoggingIn}
							/>
							<div className="text-[0.70rem] mb-2 text-red-500">
								<ErrorMessage name="username" />
							</div>
							<Field
								name="password"
								type="password"
								placeholder="Password"
								className="block w-full mb-1 py-[.65em] px-2 text-xs border border-solid boder-slate-200 bg-slate-100 rounded"
								disabled={isLoggingIn}
							/>
							<div className="text-[0.70rem] mb-2 text-red-500">
								<ErrorMessage name="password" />
							</div>
							<button
								type="submit"
								className="w-full px-2 py-2.5 mt-2 bg-slate-500 rounded border-0 font-bold text-xs text-white hover:cursor-pointer transform transition"
								disabled={isLoggingIn}
							>
								Login
							</button>
						</div>
					</Form>
				</Formik>
			</div>
		</div>
	);
}
