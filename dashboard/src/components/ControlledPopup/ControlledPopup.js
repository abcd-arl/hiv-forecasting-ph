import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './ControlledPopup.css';

export default function ControlledPopup() {
	const [open, setOpen] = useState(false);
	const closeModal = () => setOpen(false);
	return (
		<div>
			{' '}
			<button
				type="button"
				className="button px-2 py-1 mr-1.5 border-2 border-blue-500 disabled:bg-slate-200 rounded font-bold text-blue-500"
				onClick={() => setOpen((o) => !o)}
			>
				{' '}
				?{' '}
			</button>{' '}
			<Popup open={open} closeOnDocumentClick onClose={closeModal}>
				{' '}
				<div className="modal">
					{' '}
					<a className="close" onClick={closeModal} href="#/">
						{' '}
						<div>&times;</div>{' '}
					</a>{' '}
					<div className="ml-[-14px] mb-1 text-lg text-blue-400">DIRECTIONS</div>
					<ol className="list-decimal">
						<li>
							Click 'Add' to create new cells. You can provide how many cells to create by entering the number in the
							input box next to it. Default is 1.
						</li>
						<li>
							Click 'Save' to save your changes. Keep in mind that the saved values are used when generating the
							forecast.
						</li>
						<li>Click 'Select' to select editable cells. This allows you to edit or delete all selected cells. </li>
						<li>Double click an editable cell to edit separately.</li>
						<li>Click 'Generate Forecast' to generate new forecast with the current saved values.</li>
					</ol>{' '}
				</div>{' '}
			</Popup>{' '}
		</div>
	);
}
