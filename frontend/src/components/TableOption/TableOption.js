import { useRef, useState } from 'react';
import axios from 'axios';
import UploadFile from '../UploadFile/UploadFile';
import Drop from '../Drop/Drop';
import TableInstruction from '../TableInstruction/TableInstruction';
import { notify } from '../Notify/Notify';
import { Button, Divider, Input, Select } from '@mantine/core';

export default function TableOption({
	table,
	forecastingMethodInput,
	setForecastingMethodInput,
	skips,
	setSkips,
	dispatch,
	defValLastIndex,
	setDefValLastIndex,
	setData,
	cookies,
	isAdmin,
	startDate,
	setIsLoadingCharts,
	setIsLoadingTable,
}) {
	const inputNumRef = useRef(null);
	const inputDateRef = useRef(null);
	const [isInputDateEmpty, setIsInputDateEmpty] = useState(false);

	console.log(table);

	const toDateStrFormat = (array) =>
		`${array[0]}-${String(array[1]).length === 2 ? array[1] : '0' + array[1]}-${
			String(array[2]).length === 2 ? array[2] : '0' + array[2]
		}`;

	return (
		<div className="w-[98%] m-auto mb-2 flex justify-between text-xs overflow-y-clip overflow-x-auto">
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
					isAdmin={isAdmin}
					isToAppend={true}
					setIsLoadingTable={setIsLoadingTable}
					disabled={table.activity.status === 'editing'}
					inputDateRef={inputDateRef}
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
					className="w-10"
					ref={inputNumRef}
					type="text"
					defaultValue={1}
					onKeyDown={handleOnEnterNumber}
				/>
				<span className="flex items-center">more cell(s)</span>
			</div>
			<div className="flex gap-1.5">
				<TableInstruction />
				{/* <Select
					size="xs"
					defaultValue={forecastingMethodInput}
					placeholder="Choose a forecasting method"
					data={[
						{ value: '1', label: 'Grid Search - SARIMA' },
						{ value: '2', label: 'pmdarima.arima.auto_arima' },
					]}
					onChange={(value) => setForecastingMethodInput(value)}
				/> */}
				<Button
					size="xs"
					className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
					disabled={table.isSaved}
					onClick={handleOnSave}
				>
					Save
				</Button>
				{/* <Drop skips={skips} setSkips={setSkips} tableValuesLen={table.values.length} startDate={table.startDate} /> */}
				{isAdmin ? (
					<>
						<input
							className="p-[.50rem] border border-solid border-gray-300 rounded-md"
							ref={inputDateRef}
							type="date"
							defaultValue={toDateStrFormat(startDate)}
							onChange={handleOnChangeInputDate}
						/>
						<Button
							size="xs"
							className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
							disabled={isInputDateEmpty}
							onClick={handleOnUpdateTable}
						>
							Update Table
						</Button>
					</>
				) : (
					<Button
						size="xs"
						variant="gradient"
						gradient={{ from: '#ed6ea0', to: '#ec8c69', deg: 35 }}
						onClick={handleOnGenerateForecast}
					>
						Generate Forecast
					</Button>
				)}
			</div>
		</div>
	);

	function handleOnChangeInputDate(e) {
		if (!inputDateRef.current.value) setIsInputDateEmpty((state) => true);
		else setIsInputDateEmpty((state) => false);
		console.log('date is empty', isInputDateEmpty);
		console.log(inputDateRef.current.value);
	}

	function handleOnAdd(e) {
		try {
			const numOfCellsToAdd = parseInt(inputNumRef.current.value);
			if (!(!isNaN(numOfCellsToAdd) && numOfCellsToAdd > 0)) throw new Error('Please enter a positive integer number.');
			dispatch({ type: 'add', numOfCellsToAdd: numOfCellsToAdd });
		} catch (error) {
			notify('error', error.message);
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
				'http://35.93.57.77:8000/api/v1/forecast/',
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
				notify('error', 'An error occured while generating the forecast.');
			});
	}

	function handleOnUpdateTable() {
		const message =
			'It seems you have unsaved changes. The saved values will be used for generating the forecast. Do you still want to continue?';
		if (!table.isSaved && !window.confirm(message)) return;
		setIsLoadingCharts(true);
		setIsLoadingTable(true);
		const cases = table.finalValues.map((value) => (value === 'NaN' ? null : parseInt(value)));
		console.log('aiejfgiejfiafoe', skips.finalDates);
		axios
			.post(
				// 'http://35.93.57.77:8000/api/v1/update-table/',
				'http://35.93.57.77:8000/api/v1/update-table/',
				{
					cases: cases,
					startDate: inputDateRef.current.value,
					skips: skips.finalDates,
				},
				{
					headers: {
						Authorization: `Token ${cookies.token}`,
					},
				}
			)
			.then((response) => {
				setIsLoadingCharts(false);
				setIsLoadingTable(false);
				setData(response.data);
				setDefValLastIndex(response.data.actual.cases.length - 1);
				notify('success', 'The table has been updated.');
			})
			.catch((error) => {
				setIsLoadingCharts(false);
				setIsLoadingTable(false);
				notify('error', 'An error occured while updating the table.');
			});
	}
}
