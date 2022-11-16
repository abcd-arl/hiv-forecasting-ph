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
ChartJS.register(TimeSeriesScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ datasets, colors, title }) {
	const options = {
		plugins: {
			title: {
				display: true,
				text: title,
				font: {
					size: 11,
				},
			},
			legend: {
				display: datasets.length > 1,
				labels: {
					boxWidth: 20,
					boxHeight: 3,
					font: {
						size: 10.5,
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
					text: title === 'Residuals' ? 'Month and Year' : 'Year',
					font: {
						size: 11,
					},
				},
				type: 'timeseries',
				ticks: {
					autoskip: true,
					maxTicksLimit: 8,
					maxRotation: 0,
					minRotation: 0,
					font: {
						size: 10.5,
					},
				},
				time: {
					// unit: 'year',
				},
			},
			y: {
				title: {
					display: true,
					text: title === 'Residuals' ? 'Residuals' : 'Number of Cases',
					font: {
						size: 10.5,
					},
				},
				beginAtZero: true,
				ticks: {
					maxTicksLimit: 8,
					font: {
						size: 10.5,
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
				pointRadius: 0,
				showTooltips: false,
			};
		}),
	};

	return <Line data={data} options={options}></Line>;
}
