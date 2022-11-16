import { useEffect, useRef, useState } from 'react';
import deleteIcon from './icon-close.svg';
import editIcon from './icon-edit.svg';

export default function Cell({
	dispatch,
	index,
	initialValue,
	cellStatus,
	tableStatus,
	isStartingCell,
	hasError,
	setIsBeingHovered,
	displayAlert,
}) {
	const [cell, setCell] = useState({ value: initialValue, isToUpdate: false });
	const [isEditing, setIsEditing] = useState(cellStatus === 'editing');
	const [isToUpdateAutoFocus, setIsToUpdateAutoFocus] = useState(false);
	const inputRef = useRef(null);

	useEffect(() => {
		if (cellStatus !== 'index' && cellStatus !== 'default' && cellStatus !== 'initialized') {
			console.group('cell', index);
			console.log('initial value', initialValue);
			console.log('cell value', cell.value);
			console.log('cell status', cellStatus);
			console.log('table status', tableStatus);
			console.log('isEditing', isEditing);
			console.groupEnd();
		}

		if (cellStatus === 'editing' && tableStatus === 'editing' && !isEditing) setIsEditing(true);

		if (tableStatus === 'saving' && isEditing) {
			inputRef.current.focus();
			inputRef.current.blur();
		}
	});

	useEffect(() => {
		if (cell.isToUpdate) {
			dispatch({ type: 'update', index: index, value: cell.value ? cell.value : 'NaN' });
		}
	}, [cell, dispatch]);

	function handleInputOnBlur(e) {
		if (tableStatus === 'editing' && isEditing) return;
		setIsEditing(false);
		setIsToUpdateAutoFocus(false);
		setCell({ value: e.target.value ? e.target.value : 'NaN', isToUpdate: true });
	}

	function handleInputOnChange(e) {
		setCell({ value: e.target.value, isToUpdate: false });
	}

	function handleDataOnMouseOver(e) {
		if (setIsBeingHovered !== null) setIsBeingHovered((state) => true);
	}

	function handleDataOnMouseOut(e) {
		if (setIsBeingHovered !== null) setIsBeingHovered((state) => false);
	}

	function handleDataOnDoubleClick(e) {
		if (cellStatus === 'default') {
			displayAlert('warning', 'Cannot edit default values.');
			return;
		}

		if (tableStatus === 'editing') {
			displayAlert('warning', 'Please finish editing first.');
			return;
		}

		setIsEditing(true);
		setIsToUpdateAutoFocus(true);
	}

	function handleDataOnEdit(e) {
		dispatch({ type: 'edit', index: index });
	}

	function handleDataOnDelete(e) {
		let alertText = 'Are you sure you want to delete this cell and the cells after?';
		if (window.confirm(alertText)) dispatch({ type: 'delete', index: index });
	}

	const cellOptions = (function () {
		return (
			<div className="hidden group-hover:flex flex-col gap-0.5 absolute top-[-.6rem] right-[-.55rem] z-50">
				<button className="w-4 p-0.5 bg-slate-300 border border-slate-400 rounded-full" onClick={handleDataOnDelete}>
					<img className="w-full" src={deleteIcon} />
				</button>
				<button className="w-4 p-0.5 bg-slate-300 border border-slate-400 rounded-full" onClick={handleDataOnEdit}>
					<img className="w-full" src={editIcon} />
				</button>
			</div>
		);
	})();

	if (isEditing) {
		return (
			<td className="border border-slate-300">
				<input
					className="w-[95%] h-[1.7rem] m-auto block text-center border-b-2 border-blue-500 focus:border-none"
					ref={inputRef}
					placeholder="NaN"
					defaultValue={cell.value}
					onChange={handleInputOnChange}
					onBlur={handleInputOnBlur}
					autoFocus={isStartingCell || isToUpdateAutoFocus}
				></input>
			</td>
		);
	}

	return (
		<td
			className={`border border-slate-300 ${
				cellStatus === 'default'
					? 'bg-slate-50'
					: `${
							tableStatus === 'selecting'
								? 'editable hover:border-2 hover:border-slate-500 group peer peer-hover:border-2 peer-hover:border-slate-500'
								: ''
					  }`
			}`}
			onDoubleClick={handleDataOnDoubleClick}
			onMouseEnter={handleDataOnMouseOver}
			onMouseLeave={handleDataOnMouseOut}
		>
			<div
				className={`${cellStatus === 'index' ? '' : 'cell'}, ${
					hasError ? 'text-red-500' : ''
				} text-xs text-center relative`}
			>
				{cell.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
				{cellStatus !== 'index' && cellStatus !== 'default' && tableStatus === 'selecting' && cellOptions}
			</div>
		</td>
	);
}
