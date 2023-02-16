import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ datasets, colors, title }) {
	const options = {
		// maintainAspectRatio: true,
		// responsive: true,
		plugins: {
			title: {
				display: true,
				text: title,
				font: {
					size: 12,
				},
			},
			legend: {
				display: false,
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Month and Year',
					font: {
						size: 11,
					},
				},
				ticks: {
					autoskip: true,
					maxTicksLimit: 6,
					maxRotation: 0,
					minRotation: 0,
					font: {
						size: 11,
					},
				},
			},
			y: {
				title: {
					display: true,
					text: 'Number of Cases',
					font: {
						size: 11,
					},
				},
				beginAtZero: true,
				ticks: {
					autoskip: true,
					maxTicksLimit: 6,
					font: {
						size: 11,
					},
				},
			},
		},
	};

	function getLabels(dataset) {
		return [...Array(dataset.cases.length).keys()].map((i) => {
			const d = new Date(dataset.startDate[0], dataset.startDate[1] + i, 0);
			return d.toLocaleString([], { year: 'numeric', month: 'short' });
		});
	}

	const data = {
		labels: getLabels(datasets[0]),
		datasets: datasets.map((dataset, idx) => {
			return {
				label: dataset.name,
				data: dataset.cases,
				// borderColor: 'rgb(15, 82, 186)',
				// borderWidth: 2,
				backgroundColor: colors[idx],
				borderRadius: 3,
				// borderSkipped: false,
				// barThickness: 10,
				barPercentage: 0.9,
			};
		}),
	};

	return (
		<>
			<Bar options={options} data={data} />
			<div className="invisible">to make responsive</div>
		</>
	);
}
