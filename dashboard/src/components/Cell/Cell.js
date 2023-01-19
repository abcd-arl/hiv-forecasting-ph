import { useEffect, useRef, useState } from 'react';
import { notify } from '../Notify/Notify';
import { ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';

export default function Cell({
	dispatch,
	index,
	initialValue,
	cellStatus,
	tableStatus,
	isStartingCell,
	hasError,
	setIsBeingHovered,
}) {
	const [cell, setCell] = useState({ value: initialValue, isToUpdate: false });
	const [isEditing, setIsEditing] = useState(cellStatus === 'editing');
	const [isToUpdateAutoFocus, setIsToUpdateAutoFocus] = useState(false);
	const inputRef = useRef(null);

	useEffect(() => {
		// if (cellStatus !== 'index' && cellStatus !== 'default' && cellStatus !== 'initialized') {
		// 	console.group('cell', index);
		// 	console.log('initial value', initialValue);
		// 	console.log('cell value', cell.value);
		// 	console.log('cell status', cellStatus);
		// 	console.log('table status', tableStatus);
		// 	console.log('isEditing', isEditing);
		// 	console.groupEnd();
		// }

		if (cellStatus === 'replaced') {
			cell.value = initialValue;
			dispatch({ type: 'update', index: index, value: isNaN(initialValue) ? 'NaN' : initialValue });
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
			notify('warning', 'Original values cannot be edited.');
			return;
		}

		if (tableStatus === 'editing') {
			notify('warning', 'Please finish editing first.');
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
			<div className="hidden group-hover:flex flex-col gap-0.5 absolute top-[-.65rem] right-[-.7rem] z-50">
				<ActionIcon
					size="xs"
					radius="lg"
					color="gray.9"
					className="bg-slate-300 hover:bg-slate-300 border border-solid border-slate-400"
					onClick={handleDataOnDelete}
				>
					<IconTrash size={18} />
				</ActionIcon>
				<ActionIcon
					size="xs"
					radius="lg"
					color="gray.9"
					className="bg-slate-300 hover:bg-slate-300 border border-solid border-slate-400"
					onClick={handleDataOnEdit}
				>
					<IconEdit size={18} />
				</ActionIcon>
			</div>
		);
	})();

	if (isEditing) {
		return (
			<td className="border border-slate-300 border-solid">
				<input
					className="w-[85%] focus:w-[100%] h-[1.8rem] m-auto flex items-center text-center border-0 border-b-2 border-blue-500 focus:border-none"
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
			className={`border border-slate-300 border-solid ${
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
					hasError ? 'text-red-500 font-bold' : ''
				} text-xs text-center relative`}
			>
				{cell.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
				{cellStatus !== 'index' && cellStatus !== 'default' && tableStatus === 'selecting' && cellOptions}
			</div>
		</td>
	);
}
