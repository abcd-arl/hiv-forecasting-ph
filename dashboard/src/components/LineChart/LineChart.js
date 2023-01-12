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
	y_title = 'Number of Cases',
	borderDashes = null,
	isWide = false,
	timeUnit = 'month',
	pointRadius = 0,
}) {
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
					drawTime: 'beforeDraw',
				},
				annotations: {},
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

	const data = {
		datasets: datasets.map((dataset, idx) => {
			console.log(dataset.cases);
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

	return (
		<>
			<Line data={data} options={options}></Line>
			<div className="invisible">to make responsive</div>
		</>
	);
}
