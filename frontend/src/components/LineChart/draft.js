import { useRef, useState } from 'react';
import axios from 'axios';
import UploadFile from '../UploadFile/UploadFile';
import TableInstruction from '../TableInstruction/TableInstruction';
import { notify } from '../Notify/Notify';
import { Button, Divider, Input, Modal } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

export default function TableOption({
	table,
	dispatch,
	defValLastIndex,
	setDefValLastIndex,
	setData,
	cookies,
	isAdmin,
	startDate,
	setIsLoadingCharts,
	setIsLoadingTable,
	displayAlert,
}) {
	const inputNumRef = useRef(null);
	const [datePickerValue, setDatePickerValue] = useState(new Date(startDate));
	const [isInputDateEmpty, setIsInputDateEmpty] = useState(false);

	const toDateStrFormat = (array) =>
		`${array[0]}-${String(array[1]).length === 2 ? array[1] : '0' + array[1]}-${
			String(array[2]).length === 2 ? array[2] : '0' + array[2]
		}`;

	return (
		<div className="w-[98%] mx-auto mb-2 flex justify-between text-xs">
			<div className="flex gap-1">
				<Button
					size="xs"
					className={`px-2   rounded ${
						table.activity.status === 'selecting' ? 'bg-red-400 hover:bg-red-400' : 'bg-slate-500 hover:bg-slate-500'
					}`}
					disabled={
						(!isAdmin && defValLastIndex === table.values.length - 1) ||
						['editing', 'saving'].includes(table.activity.status)
					}
					onClick={handleOnSelect}
				>
					{table.activity.status === 'selecting' ? 'Cancel' : 'Select'}
				</Button>
				<Divider orientation="vertical" className="mx-1" />
				<UploadFile
					dispatch={dispatch}
					displayAlert={displayAlert}
					isToAppend={true}
					setIsLoadingTable={setIsLoadingTable}
					disabled={table.activity.status === 'editing'}
				/>
				<span className="mx-1 flex items-center">or</span>
				<Button
					size="xs"
					className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
					onClick={handleOnAdd}
					disabled={table.activity.status === 'editing'}
				>
					Add
				</Button>
				<Input
					size="xs"
					className="w-9"
					ref={inputNumRef}
					type="text"
					defaultValue={1}
					onKeyDown={handleOnEnterNumber}
				/>
				<span className="flex items-center">more cell(s)</span>
			</div>
			<div className="flex gap-1.5">
				<TableInstruction />
				<Button
					size="xs"
					className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
					disabled={table.isSaved}
					onClick={handleOnSave}
				>
					Save
				</Button>
				{isAdmin ? (
					<>
						<DatePicker
							size="xs"
							className="w-[150px]"
							placeholder="Pick date"
							value={datePickerValue}
							defaultValue={new Date(startDate)}
							onChange={setDatePickerValue}
							excludeDate={(date) => date.getDate() !== 1}
						/>
						{/* <input
							className="p-[.30rem] border border-slate-400 mr-1.5"
							ref={inputDateRef}
							type="date"
							defaultValue={toDateStrFormat(startDate)}
							onChange={handleOnChangeInputDate}
						/> */}
						<button
							className="px-2 py-1.5 bg-slate-500 rounded font-bold text-white disabled:bg-slate-200"
							onClick={handleOnUpdateTable}
							disabled={datePickerValue === null}
						>
							Update Table
						</button>
					</>
				) : (
					<Button
						size="xs"
						variant="gradient"
						gradient={{ from: 'indigo', to: 'cyan' }}
						className="hover:-translate-y-0.5 transform transition"
						onClick={handleOnGenerateForecast}
					>
						Generate Forecast
					</Button>
				)}
			</div>
		</div>
	);

	// function handleOnChangeInputDate(e) {
	// 	if (!inputDateRef.current.value) setIsInputDateEmpty((state) => true);
	// 	else setIsInputDateEmpty((state) => false);
	// 	console.log('date is empty', isInputDateEmpty);
	// 	console.log(inputDateRef.current.value);
	// }

	function handleOnAdd(e) {
		try {
			const numOfCellsToAdd = parseInt(inputNumRef.current.value);
			if (!(!isNaN(numOfCellsToAdd) && numOfCellsToAdd > 0)) throw new Error('Please enter a positive integer number.');
			dispatch({ type: 'add', numOfCellsToAdd: numOfCellsToAdd });
		} catch (error) {
			displayAlert('danger', error.message);
		}
	}

	function handleOnEnterNumber(e) {
		if (e.keyCode === 13) {
			if (table.activity.status !== 'editing') handleOnAdd();
			else notify('warning', 'Please finish editing first.');
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
		const cases = table.finalValues.map((value) => (value === 'NaN' ? null : parseInt(value)));

		axios
			.post(
				// 'http://35.93.57.77:8000/api/v1/forecast/',
				'http://127.0.0.1:8000/api/v1/forecast/',
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
		const cases = table.finalValues.map((value) => (value === 'NaN' ? null : parseInt(value)));

		axios
			.post(
				// 'http://35.93.57.77:8000/api/v1/update-table/',
				'http://127.0.0.1:8000/api/v1/update-table/',
				{
					cases: cases,
					startDate: datePickerValue.toISOString().split('T')[0],
				},
				{
					headers: {
						Authorization: `Token ${cookies.token}`,
					},
				}
			)
			.then((response) => {
				setIsLoadingCharts(false);
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
