import { useRef, useState } from 'react';
import axios from 'axios';

const isValid = (value) => value === 'NaN' || (!isNaN(value) && value > 0);

export default function TableOption({
	table,
	dispatch,
	setDefValLastIndex,
	setData,
	cookies,
	isAdmin,
	startDate,
	setIsLoadingCharts,
	displayAlert,
}) {
	const inputNumRef = useRef(null);
	const inputDateRef = useRef(null);
	const [isInputDateEmpty, setIsInputDateEmpty] = useState(false);

	const toDateStrFormat = (array) =>
		`${array[0]}-${String(array[1]).length === 2 ? array[1] : '0' + array[1]}-${
			String(array[2]).length === 2 ? array[2] : '0' + array[2]
		}`;

	return (
		<div className="w-[98%] mx-auto mb-2 flex justify-between text-xs">
			<div className="flex">
				<button
					className="px-2 py-1.5 mr-1.5 bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
					disabled={['editing', 'saving'].includes(table.activity.status)}
					onClick={handleOnSelect}
				>
					{table.activity.status === 'selecting' ? 'Cancel' : 'Select'}
				</button>
				<button
					className="px-2 py-1.5 mr-1.5 bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
					onClick={handleOnAdd}
					disabled={table.activity.status === 'editing'}
				>
					Add
				</button>
				<input className="w-9 mr-1.5 px-2 border border-slate-300 " ref={inputNumRef} type="text" defaultValue={1} />
				<span className="flex items-center">more cell(s)</span>
			</div>
			<div>
				<button
					className="px-2 py-1.5 mr-1.5 bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
					disabled={table.isSaved}
					onClick={handleOnSave}
				>
					Save
				</button>
				{isAdmin ? (
					<>
						<input
							className="p-[.30rem] border border-slate-400 mr-1.5"
							ref={inputDateRef}
							type="date"
							defaultValue={toDateStrFormat(startDate)}
							onChange={handleOnChangeInputDate}
						/>
						<button
							className="px-2 py-1.5 bg-slate-500 rounded font-bold text-white disabled:bg-slate-200"
							onClick={handleOnUpdateTable}
							disabled={isInputDateEmpty}
						>
							Update Table
						</button>
					</>
				) : (
					<button
						className="px-2 py-1.5 bg-red-400 rounded font-bold text-white hover:bg-red-500 hover:-translate-y-0.5 transform transition"
						onClick={handleOnGenerateForecast}
					>
						Generate Forecast
					</button>
				)}
			</div>
		</div>
	);

	function handleOnChangeInputDate(e) {
		if (!inputDateRef.current.value) setIsInputDateEmpty((state) => true);
		else setIsInputDateEmpty((state) => false);
		console.log('date is empty', isInputDateEmpty);
	}

	function handleOnAdd(e) {
		try {
			const numOfCellsToAdd = parseInt(inputNumRef.current.value);
			if (!isValid(numOfCellsToAdd)) throw 'Please enter a positive integer number.';
			dispatch({ type: 'add', numOfCellsToAdd: numOfCellsToAdd });
		} catch (error) {
			displayAlert('danger', error);
		}
	}

	function handleOnSave(e) {
		if (table.activity.status === 'editing') dispatch({ type: 'pre-save' });
		else dispatch({ type: 'save' });
	}

	function handleOnSelect(e) {
		table.activity.status === 'selecting' ? dispatch({}) : dispatch({ type: 'select' });
	}

	function handleOnProgressAxios(progress) {
		console.log(progress);
	}

	function handleOnGenerateForecast(e) {
		const message =
			'It seems you still have unsaved changes. The saved values will be used for generating the forecast. Do you still want to continue?';
		if (!table.isSaved && !window.confirm(message)) return;
		setIsLoadingCharts(true);
		const cases = table.finalValues.map((value) => parseInt(value));

		axios
			.post(
				'https://hiv-forecasting-ph-api.herokuapp.com/api/v1/forecast/',
				{
					cases: cases,
					startDate: startDate,
				},
				{
					onUploadProgress: handleOnProgressAxios,
				}
			)
			.then((response) => {
				console.log(response);
				setData(response.data);
				setIsLoadingCharts(false);
			})
			.catch((error) => {
				setIsLoadingCharts(false);
				console.log(error.message);
				displayAlert('danger', 'An error occured while generating the forecast.');
			});
	}

	function handleOnUpdateTable() {
		const message =
			'It seems you have unsaved changes. The saved values will be used for generating the forecast. Do you still want to continue?';
		if (!table.isSaved && !window.confirm(message)) return;
		setIsLoadingCharts(true);
		const cases = table.finalValues.map((value) => parseInt(value));

		axios
			.post(
				'https://hiv-forecasting-ph-api.herokuapp.com/api/v1/update-table/',
				{
					cases: cases,
					startDate: inputDateRef.current.value,
				},
				{
					headers: {
						Authorization: `Token ${cookies.token}`,
					},
				}
			)
			.then((response) => {
				setIsLoadingCharts(false);
				console.log('success', response);
				displayAlert('success', 'The table has been successfuly updated.');
				setData(response.data);
				setDefValLastIndex(response.data.actual.cases.length - 1);
			})
			.catch((error) => {
				setIsLoadingCharts(false);
				console.log(error.message);
				displayAlert('danger', 'An error occured while updating the table.');
			});
	}
}
