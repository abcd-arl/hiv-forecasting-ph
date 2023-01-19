import LineChart from '../LineChart/LineChart';
import { useState, useRef, useEffect } from 'react';
import { DateRangePicker } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons';

export default function LineChartRanged({ initialTitle, dataset, color }) {
	const [dateRange, setDateRange] = useState(getDatePickerValue(dataset.startDate, dataset.cases.length));
	const defaultDateRange = useRef(dateRange);

	useEffect(() => {
		setDateRange(getDatePickerValue(dataset.startDate, dataset.cases.length));
	}, [dataset]);

	const finalTitle = () => {
		const fromDate = dateRange[0] === null ? defaultDateRange.current[0] : dateRange[0];
		const toDate = dateRange[1] === null ? defaultDateRange.current[1] : dateRange[1];
		const dateToStr = (date) => date.toLocaleDateString('en-us', { year: 'numeric', month: 'long' });
		return `${initialTitle} from ${dateToStr(fromDate)} to ${dateToStr(toDate)}`;
	};

	const datasetRanged = (() => {
		const cases = [];
		let [start, end] = [0, dataset.cases.length];

		if (dateRange[0] !== null && dateRange[1] !== null) {
			start = start + getMonthDifference([new Date(dataset.startDate), dateRange[0]]);
			end = start + getMonthDifference([dateRange[0], dateRange[1]]) + 1;
		} else if (dateRange[0] === null && dateRange[1] !== null) {
			end = start + getMonthDifference([dateRange[0], dateRange[1]]) + 1;
		} else if (dateRange[1] === null && dateRange[0] !== null) {
			start = start + getMonthDifference([new Date(dataset.startDate), dateRange[0]]);
		} else {
			start = start + getMonthDifference([new Date(dataset.startDate), defaultDateRange.current[0]]);
			end = start + getMonthDifference([defaultDateRange.current[0], defaultDateRange.current[1]]) + 1;
		}

		for (let i = start; i < end; i++) cases.push(dataset.cases[i]);

		const newStartDate = new Date(dataset.startDate[0], dataset.startDate[1] + start, 0);
		return { cases: cases, startDate: [newStartDate.getFullYear(), newStartDate.getMonth() + 1, 0] };
	})();

	return (
		<>
			<LineChart title={finalTitle} datasets={[datasetRanged]} colors={[color]} pointRadius={2} />
			<DateRangePicker
				size="xs"
				icon={<IconCalendarEvent size={18} />}
				maxDate={new Date(dataset.startDate[0], dataset.startDate[1] + dataset.cases.length - 1, 1)}
				minDate={new Date(dataset.startDate[0], dataset.startDate[1] - 1, 1)}
				excludeDate={(date) => date.getDate() !== 1}
				placeholder="Pick dates range"
				defaultValue={dateRange}
				value={dateRange}
				onChange={setDateRange}
				className="w-[47.5%] min-w-[300px]"
				description={'The days in the dates are being disregarded.'}
			/>
		</>
	);
}

function getMonthDifference([startDate, endDate]) {
	return endDate.getMonth() - startDate.getMonth() + 12 * (endDate.getFullYear() - startDate.getFullYear());
}

function getDatePickerValue(datasetStartDate, length) {
	const startYear = datasetStartDate[0];
	const startMonth = datasetStartDate[1];
	const casesLastIndex = length - 1;
	const rangeMonths = 11;

	const startDate = new Date(
		startYear,
		startMonth + (rangeMonths < casesLastIndex ? casesLastIndex - rangeMonths : casesLastIndex),
		0
	);

	const endDate = new Date(startYear, startMonth + casesLastIndex, 0);
	startDate.setDate(1);
	endDate.setDate(1);
	return [startDate, endDate];
}
