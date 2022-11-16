import { Formik, Field, Form, ErrorMessage } from 'formik';
import Loading from '../Loading/Loading';
import * as Yup from 'yup';
import axios from 'axios';
import { useState } from 'react';

export default function LoginForm({ cookies, setCookie }) {
	const [isIncorrect, setIsIncorrect] = useState(null);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	return (
		<div className="relative max-w-[80%] mx-auto">
			{isLoggingIn && <Loading />}
			<div className={isLoggingIn ? `opacity-50` : ''}>
				<h1 className="w-fit mx-auto text-2xl">ADMIN</h1>
				<Formik
					initialValues={{ username: '', password: '' }}
					validationSchema={Yup.object({
						username: Yup.string().required('No username provided'),
						password: Yup.string().required('No password provided'),
					})}
					onSubmit={(values) => {
						setIsLoggingIn(true);
						axios
							.post('https://hiv-forecasting-ph-api.herokuapp.com/api/dj-rest-auth/login/', values)
							.then((response) => {
								console.log('here');
								setIsLoggingIn(false);
								setCookie('token', response.data.key, { path: '/', maxAge: 1000, secure: true, sameSite: 'strict' });
								window.setTimeout(() => {
									if (cookies['token']) alert('Your session has expired.');
								}, 3600000);
							})
							.catch((error) => {
								setIsIncorrect(true);
								setIsLoggingIn(false);
								console.log('error:', error.messsage);
							});
					}}
				>
					<Form className="w-[80%] max-w-[400px] my-8 mx-auto">
						<div className={`${isIncorrect ? 'block' : 'hidden'} text-[0.70rem] mb-2 text-red-500 font-bold`}>
							Incorrect username or password
						</div>
						<Field
							name="username"
							type="text"
							placeholder="Username"
							className="block w-[95%] mb-1 py-1.5 px-2 text-[0.75rem] border boder-slate-200 bg-slate-100 rounded"
							disabled={isLoggingIn}
						/>
						<div className="text-[0.70rem] mb-2 text-red-500">
							<ErrorMessage name="username" />
						</div>
						<Field
							name="password"
							type="password"
							placeholder="Password"
							className="block w-[95%] mb-1 py-1.5 px-2 text-[0.75rem] border boder-slate-200 bg-slate-100 rounded"
							disabled={isLoggingIn}
						/>
						<div className="text-[0.70rem] mb-2 text-red-500">
							<ErrorMessage name="password" />
						</div>
						<button
							type="submit"
							className="w-[95%] px-2 py-2 mt-2 bg-slate-500 rounded font-bold text-xs text-white transform transition"
							disabled={isLoggingIn}
						>
							Login
						</button>
					</Form>
				</Formik>
			</div>
		</div>
	);
}
