import { useEffect, useReducer, useRef, useState } from 'react';
import { Modal, Button, Divider, Select, Input, Text, ActionIcon } from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { IconCalendarEvent, IconX, IconPlus } from '@tabler/icons';
import InputMask from 'react-input-mask';

export default function Drop({ skips, setSkips, tableValuesLen, startDate }) {
	const [opened, setOpened] = useState(false);

	useEffect(() => {
		console.log('skips', skips);
	});

	return (
		<>
			<Modal size="lg" opened={opened} centered onClose={() => setOpened(false)} title="Drop cases">
				<div>
					<Button
						size="xs"
						leftIcon={<IconPlus size={16} />}
						variant="default"
						onClick={() => {
							const temp = [...skips.initialDates];
							temp.push({ name: '', startDate: null, length: 0 });
							setSkips({
								initialDates: temp,
								finalDates: skips.finalDates,
							});
						}}
					>
						Add
					</Button>

					{skips.initialDates.map((skip, idx) => {
						return (
							<div key={`div-${skip.name}`} className="mb-2 flex justify-between">
								<DateRangePicker
									key={`dateRange-${skip.name}`}
									size="xs"
									icon={<IconCalendarEvent size={18} />}
									minDate={new Date(startDate[0], startDate[1], 0)}
									maxDate={new Date(startDate[0], startDate[1] + tableValuesLen - 1, 0)}
									excludeDate={(date) => date.getDate() !== 1}
									clearable={false}
									placeholder="Pick dates range"
									defaultValue={
										skip.startDate === null
											? [null, null]
											: [
													new Date(skip.startDate[0], skip.startDate[1], 0),
													new Date(skip.startDate[0], skip.startDate[1] + skip.length - 1, 0),
											  ]
									}
									onChange={(value) => {
										if (!value.includes(null)) {
											const temp = [...skips.initialDates];
											temp[idx].startDate = [value[0].getFullYear(), value[0].getMonth() + 1, 0];
											temp[idx].length = getMonthDifference(value) + 1;
											console.log('finalDates', skips.finalDates);
											setSkips({
												initialDates: temp,
												finalDates: skips.finalDates,
											});
										}
									}}
									className="w-[50%]"
								/>
								<Input
									key={`input-${skip.name}`}
									component={InputMask}
									id={idx}
									placeholder="Name"
									size="xs"
									className="w-[42%]"
									// defaultValue={skip.name}
									onChange={(e) => {
										const temp = [...skips];
										temp[idx].name = e.target.value;
										setSkips(temp);
									}}
								/>
								<ActionIcon
									key={`delete-${skip.name}`}
									variant="default"
									size="30px"
									onClick={() => {
										const temp = [...skips.initialDates];
										temp.splice(idx, 1);
										setSkips({
											initialDates: temp,
											finalDates: skips.finalDates,
										});
									}}
								>
									<IconX size={16} />
								</ActionIcon>
							</div>
						);
					})}
				</div>
			</Modal>
			<Button
				size="xs"
				className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
				onClick={() => setOpened(true)}
			>
				Drop
			</Button>
		</>
	);
}

function getMonthDifference([startDate, endDate]) {
	return endDate.getMonth() - startDate.getMonth() + 12 * (endDate.getFullYear() - startDate.getFullYear());
}
