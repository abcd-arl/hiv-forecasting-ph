import errorIcon from './icon-error.svg';

export default function Error() {
	return (
		<div className="max-w-[700px] h-[50vh] mx-auto text-center font-helvetica flex flex-col items-center justify-center gap-2">
			<img src={errorIcon} className="w-20 mx-auto mb-3" alt="Error" />
			<h2 className="text-xl font-bold">Oh no!</h2>
			<p className="text-[0.85rem]">Something went wrong while loading the data. Please hit refresh</p>
			<small className="text-red-500">
				<a href="mailto:abdulrahman.lingga@g.msuiit.edu.ph?subject=HIV Forecasting Project Error">Report</a>
			</small>
		</div>
	);
}
