import { useState, useEffect, useReducer } from 'react';
import { Store } from 'react-notifications-component';
import TableOption from '../TableOption/TableOption';
import Cell from '../Cell/Cell';

const isValid = (value) => value === 'NaN' || (!isNaN(value) && value > 0);
const isEmpty = (obj) => Object.keys(obj).length === 0;
const reducer = (state, action) => {
	switch (action.type) {
		case 'initialize':
			return {
				values: [...action.dataset.cases],
				finalValues: [...action.dataset.cases],
				startDate: [...action.dataset.startDate],
				isSaved: true,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'initialized',
					startIndex: 0,
				},
			};

		case 'add':
			return {
				values: [...state.values].concat(Array(action.numOfCellsToAdd).fill('')),
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'editing',
					startIndex: state.values.length,
				},
			};

		case 'pre-save':
			return {
				values: [...state.values],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: true,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'saving',
					startIndex: state.activity.startIndex,
				},
			};

		case 'update':
			const valuesForUpdate = [...state.values];
			valuesForUpdate[action.index] = action.value;

			if (action.index in state.foundErrors && isValid(action.value)) delete state.foundErrors[action.index];
			else if (!(action.index in state.foundErrors) && !isValid(action.value)) state.foundErrors[action.index] = true;

			return {
				values: valuesForUpdate,
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: state.isSaving,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'updated',
					startIndex: null,
				},
			};

		case 'save':
			let valuesForSave = [...state.values];
			if (!isEmpty(state.foundErrors)) valuesForSave = [...state.finalValues];

			return {
				values: [...state.values],
				finalValues: valuesForSave,
				startDate: [...state.startDate],
				isSaved: isEmpty(state.foundErrors),
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'saved',
					startIndex: null,
				},
			};

		case 'post-save':
			let valuesForPostSave = [...state.values];
			if (!isEmpty(state.foundErrors)) valuesForPostSave = [...state.finalValues];

			return {
				values: [...state.values],
				finalValues: valuesForPostSave,
				startDate: [...state.startDate],
				isSaved: isEmpty(state.foundErrors),
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'post-saved',
					startIndex: null,
				},
			};

		case 'edit':
			return {
				values: [...state.values],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'editing',
					startIndex: action.index,
				},
			};

		case 'delete':
			for (let key in state.foundErrors) {
				if (parseInt(key) <= action.index) delete state.foundErrors[key];
			}

			return {
				values: [...state.values.slice(0, action.index)],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: false,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'deleted',
					startIndex: null,
				},
			};

		case 'select':
			return {
				values: [...state.values],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: state.isSaved,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'selecting',
					startIndex: action.index,
				},
			};

		default:
			return {
				values: [...state.values],
				finalValues: [...state.finalValues],
				startDate: [...state.startDate],
				isSaved: state.isSaved,
				isSaving: false,
				foundErrors: structuredClone(state.foundErrors),
				activity: {
					status: 'standby',
					startIndex: action.index,
				},
			};
	}
};

export default function Table({ dataset, setData, setIsLoadingCharts, isAdmin, cookies, updateTableAsAdmin }) {
	const [defValLastIndex, setDefValLastIndex] = useState(null);
	const [table, dispatch] = useReducer(reducer, {
		values: [],
		finalValues: [],
		startDate: [],
		isSaved: true,
		isSaving: false,
		foundErrors: {},
		activity: {
			status: 'standby',
			startIndex: [],
		},
	});
	const [isBeingHovered, setIsBeingHovered] = useState(false);

	useEffect(() => {
		console.group('Table Values');
		console.log('dataset', dataset);
		console.log('cookies', cookies);
		console.log('history', table.history);
		console.log('startDate', table.startDate);
		console.log('found errors', table.foundErrors);
		console.log('initial table values:', table.values);
		console.log('initial table status:', table.activity.status, table.activity.startIndex);
		console.log('final table values:', table.finalValues);
		console.log('final table is recent:', table.isSaved);
		console.log('is saivng', table.isSaving);
		console.log('last def value', table.values[defValLastIndex]);
		console.groupEnd();
	});

	useEffect(() => {
		switch (table.activity.status) {
			case 'initialized':
				console.log('here');
				setDefValLastIndex(table.values.length - 1);
				break;
			case 'updated':
				if (table.isSaving) dispatch({ type: 'post-save' });

				break;
			case 'saved':
			case 'post-saved':
				if (!isEmpty(table.foundErrors))
					displayAlert('danger', 'Unable to save changes. One or more input values are invalid.');
				break;
			default:
				return;
		}
	}, [table]);

	useEffect(() => {
		if (isAdmin) dispatch({ type: 'initialize', dataset: dataset });
	}, [dataset, isAdmin]);

	useEffect(() => {
		dispatch({ type: 'initialize', dataset: dataset });
	}, []);

	function handleEmptyCellOnMouseOver(e) {
		setIsBeingHovered((state) => true);
	}

	function handleEmptyCellOnMouseOut(e) {
		setIsBeingHovered((state) => false);
	}

	function displayAlert(type, message) {
		Store.addNotification({
			message: message,
			type: type,
			insert: 'top',
			container: 'bottom-left',
			animationIn: ['animate__animated', 'animate__fadeInUp'],
			animationOut: ['animate__animated', 'animate__fadeOut'],
			dismiss: {
				duration: 4000,
				// onScreen: true,
				showIcon: true,
				pauseOnHover: true,
			},
		});
	}

	const tableRows = (() => {
		let startYear = table.startDate[0];
		const rows = [];
		let row =
			table.startDate[1] > 1
				? [
						<td className="w-16 py-2 text-xs text-center bg-slate-200 border border-slate-300" key={startYear}>
							{startYear++}
						</td>,
				  ].concat(
						Array(table.startDate[1] - 1).fill(
							<td
								className="border border-slate-300 bg-slate-50"
								onMouseEnter={handleEmptyCellOnMouseOver}
								onMouseOut={handleEmptyCellOnMouseOut}
							></td>
						)
				  )
				: [];

		for (let i = 0; i < table.values.length; i++) {
			if (row.length % 13 === 0) {
				if (!isEmpty(row))
					rows.push(
						<tr
							key={'row-' + i / 12}
							className={`${
								!isAdmin && i <= defValLastIndex
									? ''
									: `${
											isBeingHovered
												? ''
												: 'peer peer-hover:[&>td.editable]:border-2 peer-hover:[&>td.editable]:border-slate-500'
									  }`
							} `}
						>
							{row}
						</tr>
					);
				row = [
					<td className="w-16 py-2 text-xs text-center bg-slate-200 border border-slate-300" key={startYear}>
						{startYear++}
					</td>,
				];
			}

			let cellStatus = null;
			if (!isAdmin && i <= defValLastIndex) cellStatus = 'default';
			else if (i >= table.activity.startIndex) cellStatus = table.activity.status;
			else cellStatus = 'standby';

			row.push(
				<Cell
					key={i}
					dispatch={dispatch}
					index={i}
					initialValue={table.values[i]}
					cellStatus={cellStatus}
					tableStatus={table.activity.status}
					isStartingCell={table.activity.startIndex === i}
					hasError={table.foundErrors[i] === true}
					setIsBeingHovered={
						!isAdmin && i >= defValLastIndex - ((defValLastIndex + table.startDate[1]) % 12) + 1 && i <= defValLastIndex
							? setIsBeingHovered
							: null
					}
					displayAlert={displayAlert}
				/>
			);
		}

		if (!isEmpty(row))
			rows.push(
				<tr
					key={'row-' + rows.length + 1}
					className={'peer peer-hover:[&>td.editable]:border-2 peer-hover:[&>td.editable]:border-slate-500'}
				>
					{row}
				</tr>
			);

		return rows;
	})();

	return (
		<div className="w-[100%]">
			<TableOption
				table={table}
				dispatch={dispatch}
				setData={setData}
				cookies={cookies}
				isAdmin={isAdmin}
				updateTableAsAdmin={updateTableAsAdmin}
				startDate={dataset.startDate}
				setIsLoadingCharts={setIsLoadingCharts}
				displayAlert={displayAlert}
			/>
			<div className="w-full pb-2 overflow-auto">
				<table className="w-[98%] mx-auto table-fixed border-collapse text-xs">
					<thead>
						<tr>
							<th className="w-16 py-2 bg-slate-200 border border-slate-300">Year</th>
							{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
								<th key={month} className="w-20 py-2 bg-slate-200 border border-slate-300">
									{month}
								</th>
							))}
						</tr>
					</thead>
					<tbody>{tableRows}</tbody>
				</table>
			</div>
		</div>
	);
}
