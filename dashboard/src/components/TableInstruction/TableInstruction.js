import { useState } from 'react';
import { Modal, Button } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons';

export default function TableInstruction() {
	const [opened, setOpened] = useState(false);

	return (
		<>
			<Modal size="lg" opened={opened} centered onClose={() => setOpened(false)} title="Directions">
				<ol className="ml-[-1.5em] list-decimal text-sm">
					<li>
						Click 'Add' to create new cells. You can provide how many cells to create by entering the number in the
						input box next to it. Default is 1.
					</li>
					<li>Click 'Save' to save your changes.</li>
					<li>Click 'Select' to select editable cells. This allows you to edit or delete all selected cells. </li>
					<li>Double click an editable cell to edit separately.</li>
					<li>Click 'Upload' to upload a CSV file. Instructions will be displayed upon first click.</li>
					<li>Click 'Generate Forecast' to generate new forecast with the current saved values.</li>
				</ol>
			</Modal>
			<Button
				size="xs"
				className="px-1 bg-blue-100 hover:bg-blue-500 disabled:bg-slate-200 rounded font-bold text-blue-500 hover:text-white"
				onClick={() => setOpened(true)}
			>
				<IconQuestionMark size={18} />
			</Button>
		</>
	);
}
