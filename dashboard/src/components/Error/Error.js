import { Helmet } from 'react-helmet';
import errorIcon from './icon-error.svg';

export default function Error() {
	return (
		<>
			<Helmet>
				<title>Error | HIV Forecasting PH</title>
			</Helmet>
			<div className="max-w-[700px] h-[50vh] mx-auto text-center font-helvetica flex flex-col items-center justify-center">
				<img src={errorIcon} className="w-20 mx-auto" alt="Error" />
				<p className="text-xl font-bold mb-0">Oh no!</p>
				<p className="text-[0.85rem]">
					Something went wrong while loading the data.
					<br /> Please check that you are connected on the Internet and hit refresh.
				</p>
				<small className="text-red-500">
					<a href="mailto:abdulrahman.lingga@g.msuiit.edu.ph?subject=HIV Forecasting PH Project Error">Report</a>
				</small>
			</div>
		</>
	);
}
