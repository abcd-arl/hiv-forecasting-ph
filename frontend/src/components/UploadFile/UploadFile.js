import { IconUpload } from '@tabler/icons';
import { Popover, Button, FileInput, Flex, Checkbox, Modal } from '@mantine/core';
import { useState } from 'react';
import { notify } from '../Notify/Notify';
import instruction_img_1 from './instruction-1.png';
import instruction_img_2 from './instruction-2.png';
import instruction_img_3 from './instruction-3.png';

export default function UploadFile({ dispatch, disabled, isAdmin, setIsLoadingTable, inputDateRef }) {
	const [csvFile, setCSVFile] = useState(null);
	const [instructionModalOpened, setInstructionModalOpened] = useState(false);
	const [isToAppendChecked, setIsToAppendChecked] = useState(true);

	return (
		<>
			<Modal
				size="lg"
				opened={instructionModalOpened}
				onClose={() => setInstructionModalOpened(false)}
				centered
				title="What to upload"
			>
				<ul className="ml-[-1.5em] text-sm">
					<li className="mb-1">Only a CSV file is supported.</li>
					<li className="mb-1">
						<span>
							Make sure the file contains "No. of New HIV Cases" as header. Other headers will be disregarded.
						</span>
						<img src={instruction_img_1} />
					</li>
					<li className="mb-1">Invalid values will be converted as NaN values.</li>
					<li className="mb-1">
						<span>
							If "Append to the table" is unchecked, make sure the file also contains "Date" as header. Note that only
							the{' '}
							<a href="https://tc39.es/ecma262/#sec-date-time-string-format" target="blank">
								ISO 180 format
							</a>{' '}
							is supported.
						</span>
						<img src={instruction_img_2} />
					</li>
					<li className="mb-1">
						<span>
							You may only fill in the first row of the "Date" column that has valid value in the "No. of New HIV Cases"
							column.
						</span>
						<img src={instruction_img_3} />
					</li>
				</ul>
				<Checkbox
					label="Do not show this again."
					onChange={(event) => {
						if (event.currentTarget.checked) sessionStorage.setItem('doNotShowAgainUploadDetails', true);
					}}
					size="sm"
				/>
				<Button
					size="xs"
					className="ml-auto block bg-slate-500 hover:bg-slate-500 rounded"
					onClick={() => setInstructionModalOpened(false)}
				>
					OK
				</Button>
			</Modal>
			<Popover
				width={300}
				trapFocus
				position="bottom"
				withArrow
				shadow="md"
				disabled={instructionModalOpened}
				onOpen={() => {
					if (sessionStorage.getItem('doNotShowAgainUploadDetails')) return;
					setInstructionModalOpened(true);
				}}
			>
				<Popover.Target>
					<Button size="xs" className="px-2 bg-slate-500 hover:bg-slate-500 rounded" disabled={disabled}>
						Upload
					</Button>
				</Popover.Target>
				<Popover.Dropdown sx={(theme) => ({ background: theme.white })}>
					<Flex gap="xs" justify="left" direction="column">
						<Flex gap="xs" justify="center" align="center" direction="row">
							<FileInput
								size="xs"
								placeholder="CSV File"
								multiple={false}
								clearable={true}
								accept=".csv"
								value={csvFile}
								onChange={setCSVFile}
								icon={<IconUpload size={18} />}
								styles={(theme) => ({
									root: {
										width: '90%',
									},
								})}
							/>
							<Button
								size="xs"
								styles={(theme) => ({
									root: {
										padding: 0,
										width: '3em',
									},
								})}
								onClick={onClick}
							>
								OK
							</Button>
						</Flex>
						<Checkbox
							label="Append to the table"
							size="xs"
							checked={isAdmin ? isToAppendChecked : true}
							onChange={(event) => setIsToAppendChecked(event.currentTarget.checked)}
							disabled={!isAdmin}
						/>
					</Flex>
				</Popover.Dropdown>
			</Popover>
		</>
	);

	function readFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			const data = {
				startDate: null,
				cases: [],
				errorMessages: [],
			};

			reader.onload = function (event) {
				const csvContents = event.target.result;
				const headers = csvContents.slice(0, csvContents.indexOf('\r')).split(',');
				const numberOfNewCasesIndex = headers.indexOf('No. of New HIV Cases');
				const dateIndex = headers.indexOf('Date');

				if (numberOfNewCasesIndex < 0) return reject('Missing "No. of New HIV Cases" in header.');
				if (!isToAppendChecked && dateIndex < 0) return reject('Missing "Date" in header.');

				const rows = csvContents.slice(csvContents.indexOf('\n') + 1).split('\r\n');
				rows.map((row, index) => {
					const value = parseInt(row.split(',')[numberOfNewCasesIndex]);
					data.cases.push(value);
					if (!value && value !== 0)
						data.errorMessages.push(`Case value in row ${index} is not valid, but converted to 'NaN'`);

					return null;
				});

				if (!isToAppendChecked) {
					let firstIndex = 0;
					while (isNaN(data.cases[firstIndex])) firstIndex = firstIndex + 1;

					const firstDate = csvContents.slice(csvContents.indexOf('\n') + 1).split('\r\n')[firstIndex];
					const initialStartDate = new Date(firstDate.split(',')[dateIndex]);

					data.cases = data.cases.slice(firstIndex);

					if (initialStartDate instanceof Date && !isNaN(initialStartDate)) {
						data.startDate = initialStartDate.toISOString().substring(0, 10);
						inputDateRef.current.value = data.startDate;
					} else return reject('Invalid dates format.');
				}
				resolve(data);
			};

			reader.onerror = function (event) {
				reject('Error reading the file.');
			};

			reader.readAsText(file);
		});
	}

	function onClick(event) {
		if (instructionModalOpened) setInstructionModalOpened(false);
		if (csvFile === null) return notify('error', 'No file is uploaded.');

		setIsLoadingTable(true);
		readFile(csvFile)
			.then((data) => {
				const message =
					'Your file has more than five invalid values. Continue? Invalid values will be converted to NaN values.';
				if (data.errorMessages.length > 6 && !window.confirm(message)) return;
				data.errorMessages.map((message) => notify('warning', message));
				if (isToAppendChecked) dispatch({ type: 'append', valuesToAppend: data.cases });
				else dispatch({ type: 'replace', valuesToReplace: data.cases, newStartDate: data.startDate });
				setIsLoadingTable(false);
			})
			.catch((error) => {
				notify('error', error);
				setIsLoadingTable(false);
			});
	}
}
