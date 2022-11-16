import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ dataset, title }) {
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
				display: false,
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Month and Year',
					font: {
						size: 10.5,
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
						size: 10.5,
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
	const labels = [...Array(dataset.cases.length).keys()].map((i) => {
		const d = new Date(dataset.startDate[0], dataset.startDate[1] + i, 0);
		return d.toLocaleString([], { year: 'numeric', month: 'short' });
	});
	const data = {
		labels: labels,
		datasets: [
			{
				label: 'Dataset 1',
				data: dataset.cases,
				// borderColor: 'rgb(15, 82, 186)',
				// borderWidth: 2,
				backgroundColor: '#1d4ed8',
				borderRadius: 3,
				// borderSkipped: false,
				barThickness: 23,
			},
		],
	};

	return <Bar options={options} data={data} />;
}
