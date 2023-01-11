import {
	Chart as ChartJS,
	TimeSeriesScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useEffect, useRef, useState } from 'react';
import { DateRangePicker } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons';

ChartJS.register(TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ datasets, colors, title, hasRange = false, maintainAspectRatio, indexDashLine }) {
	const [datePickerValue, setDatePickerValue] = useState(
		datasets.length === 0 ? null : getDatePickerValue(datasets[0].startDate, datasets[0].cases.length)
	);
	const defaultDatePickerValue = useRef(datePickerValue);

	useEffect(() => {
		setDatePickerValue(getDatePickerValue(datasets[0].startDate, datasets[0].cases.length));
	}, [datasets]);

	let newTitle = title;
	if (hasRange) {
		const fromDate = datePickerValue[0] === null ? defaultDatePickerValue.current[0] : datePickerValue[0];
		const toDate = datePickerValue[1] === null ? defaultDatePickerValue.current[1] : datePickerValue[1];
		const dateToStr = (date) => date.toLocaleDateString('en-us', { year: 'numeric', month: 'long' });
		newTitle = `${title} from ${dateToStr(fromDate)} to ${dateToStr(toDate)}`;
	}

	const options = {
		maintainAspectRatio: maintainAspectRatio,
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: newTitle,
				font: {
					size: 12,
				},
			},
			legend: {
				display: datasets.length > 1,
				labels: {
					boxWidth: 20,
					boxHeight: 3,
					font: {
						size: 11,
					},
				},
				position: 'top',
				align: 'start',
			},
			tooltip: {
				callbacks: {
					title: (context) => {
						const date = new Date(context[0].raw.x);
						const formattedDate = date.toLocaleString([], {
							year: 'numeric',
							month: 'long',
						});
						return formattedDate;
					},
				},
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: title === 'Residuals' || hasRange ? 'Month and Year' : 'Year',
					font: {
						size: 11,
					},
				},
				type: 'timeseries',
				ticks: {
					autoskip: true,
					// maxTicksLimit: 8,
					source: 'data',
					bounds: 'data',
					maxRotation: 0,
					minRotation: 0,
					font: {
						size: 11,
					},
				},
				time: {
					unit: title === 'Residuals' || hasRange ? 'month' : 'year',
				},
			},
			y: {
				title: {
					display: true,
					text: title === 'Residuals' ? 'Residuals' : 'Number of Cases',
					font: {
						size: 11,
					},
				},
				beginAtZero: true,
				ticks: {
					maxTicksLimit: 8,
					font: {
						size: 11,
					},
				},
			},
		},
	};

	const data = {
		datasets: datasets.map((dataset, idx) => {
			return {
				label: dataset.name,
				data: (() => {
					const cases = [];

					let [start, end] = [0, dataset.cases.length];
					if (hasRange) {
						if (datePickerValue[0] !== null && datePickerValue[1] !== null) {
							start = start + getMonthDifference([new Date(datasets[0].startDate), datePickerValue[0]]);
							end = start + getMonthDifference([datePickerValue[0], datePickerValue[1]]) + 1;
						} else if (datePickerValue[0] === null && datePickerValue[1] !== null) {
							end = start + getMonthDifference([datePickerValue[0], datePickerValue[1]]) + 1;
						} else if (datePickerValue[1] === null && datePickerValue[0] !== null) {
							start = start + getMonthDifference([new Date(datasets[0].startDate), datePickerValue[0]]);
						} else {
							start = start + getMonthDifference([new Date(datasets[0].startDate), defaultDatePickerValue.current[0]]);
							end =
								start + getMonthDifference([defaultDatePickerValue.current[0], defaultDatePickerValue.current[1]]) + 1;
						}
					}

					for (let i = start; i < end; i++) {
						cases.push({
							x: new Date(dataset.startDate[0], dataset.startDate[1] + i, 0),
							y: dataset.cases[i],
						});
					}
					return cases;
				})(),
				backgroundColor: colors[idx],
				borderColor: colors[idx],
				borderWidth: 1,
				tension: 0.2,
				pointRadius: hasRange ? 2 : 0,
				showTooltips: false,
				borderDash: indexDashLine === idx ? [8, 5] : [0, 0],
			};
		}),
	};

	return (
		<>
			<Line data={data} options={options}></Line>
			{hasRange && (
				<>
					<DateRangePicker
						size="xs"
						icon={<IconCalendarEvent size={18} />}
						maxDate={new Date(datasets[0].startDate[0], datasets[0].startDate[1] + datasets[0].cases.length - 1, 1)}
						minDate={new Date(datasets[0].startDate[0], datasets[0].startDate[1] - 1, 1)}
						excludeDate={(date) => date.getDate() !== 1}
						placeholder="Pick dates range"
						defaultValue={datePickerValue}
						value={datePickerValue}
						onChange={setDatePickerValue}
						className="w-[47.5%] min-w-[300px]"
						description={'The days in the dates are being disregarded.'}
					/>
				</>
			)}
			<div className="invisible">to make responsive</div>
		</>
	);

	function getMonthDifference([startDate, endDate]) {
		return endDate.getMonth() - startDate.getMonth() + 12 * (endDate.getFullYear() - startDate.getFullYear());
	}

	function getDatePickerValue(datasetStartDate, casesLen) {
		const startYear = datasetStartDate[0];
		const startMonth = datasetStartDate[1];
		const casesLastIndex = casesLen - 1;
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
}
