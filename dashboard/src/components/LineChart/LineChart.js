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
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

export default function LineChart({
	title,
	datasets,
	colors,
	skips = [],
	y_title = 'Number of Cases',
	borderDashes = null,
	isWide = false,
	timeUnit = 'month',
	pointRadius = 0,
}) {
	const annotations = [];
	const data = {
		datasets: datasets.map((dataset, idx) => {
			if (skips) {
				skips.map((skip) => {
					const xMin = new Date(...skip.startDate);
					const xMax = new Date(skip.startDate[0], skip.startDate[1] + skip.length - 1, 0);
					const totalMonthsFromStart = getMonthDifference([new Date(datasets[0].startDate), xMin]);
					const yMin = Math.max(...datasets[0].cases.slice(totalMonthsFromStart, totalMonthsFromStart + skip.length));
					const yMax = yMin + 400;

					annotations.push(
						{
							type: 'line',
							borderColor: 'gray',
							borderWidth: 1.25,
							label: {
								display: true,
								backgroundColor: 'white',
								borderRadius: 0,
								color: 'gray',
								content: skip.name,
								font: {
									size: 11.5,
								},
							},
							arrowHeads: {
								start: {
									display: true,
									borderColor: 'gray',
									length: 6.5,
								},
								end: {
									display: true,
									borderColor: 'gray',
									length: 6.5,
								},
							},
							xMax: xMax,
							xMin: xMin,
							xScaleID: 'x',
							yMax: yMax,
							yMin: yMax,
							yScaleID: 'y',
						},
						{
							type: 'line',
							borderColor: 'gray',
							borderDash: [6, 6],
							borderWidth: 1,
							xMax: xMin,
							xMin: xMin,
							xScaleID: 'x',
							yMax: yMax,
							yMin: 0,
							yScaleID: 'y',
						},
						{
							type: 'line',
							borderColor: 'gray',
							borderDash: [6, 6],
							borderWidth: 1,
							xMax: xMax,
							xMin: xMax,
							xScaleID: 'x',
							yMax: yMax,
							yMin: 0,
							yScaleID: 'y',
						}
					);
				});
			}

			return {
				label: dataset.name,
				data: (() => {
					const cases = [];

					for (let i = 0; i < dataset.cases.length; i++) {
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
				pointRadius: pointRadius,
				showTooltips: false,
				// borderDash: [0, 0],
			};
		}),
	};
	const options = {
		maintainAspectRatio: !isWide,
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: title,
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
				onClick: (e) => e.stopPropagation(),
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
			annotation: {
				common: {
					drawTime: 'afterDraw',
				},
				annotations: { ...annotations },
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: timeUnit[0].toUpperCase() + timeUnit.slice(1),
					font: {
						size: 11,
					},
				},
				type: 'timeseries',
				ticks: {
					autoskip: true,
					source: 'data',
					bounds: 'data',
					maxRotation: 0,
					minRotation: 0,
					font: {
						size: 11,
					},
				},
				time: {
					unit: timeUnit,
				},
			},
			y: {
				title: {
					display: true,
					text: y_title,
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

	return (
		<>
			<Line data={data} options={options}></Line>
			<div className="invisible">to make responsive</div>
		</>
	);
}

// returns how many months in between dates
function getMonthDifference([startDate, endDate]) {
	console.log(startDate, endDate);
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
