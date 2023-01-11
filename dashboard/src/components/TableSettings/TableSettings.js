import { useState } from 'react';
import { Modal, Button, Divider } from '@mantine/core';

export default function TableSettings() {
	const [opened, setOpened] = useState(false);
	return (
		<div className="w-[98%] mx-auto mb-2 flex justify-between text-xs overflow-y-clip overflow-x-auto">
			<Modal size="lg" opened={opened} centered onClose={() => setOpened(false)} title="Settings">
				<Divider my="md" label="Data Preparation" />
				<Divider my="md" label="Forecasting Model" />
			</Modal>

			<Button
				size="xs"
				className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
				onClick={() => setOpened(true)}
			>
				Settings
			</Button>
		</div>
	);
}
