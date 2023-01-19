import { showNotification } from '@mantine/notifications';
import { IconAlertTriangle, IconX, IconCheck } from '@tabler/icons';

export function notify(type, message) {
	const variation = {
		success: {
			color: 'teal',
			title: 'Success',
			icon: <IconCheck size={20} />,
		},
		error: {
			color: 'red',
			title: 'Error',
			icon: <IconX size={20} />,
		},
		warning: {
			color: 'yellow',
			title: 'Warning',
			icon: <IconAlertTriangle size={20} />,
		},
	};

	return showNotification({
		icon: variation[type].icon,
		color: variation[type].color,
		title: variation[type].title,
		message: message,
	});
}
