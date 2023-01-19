import { useEffect, useReducer, useRef, useState } from 'react';
import { Modal, Button, Divider, Select, Input, Text, ActionIcon } from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { IconCalendarEvent, IconX, IconPlus } from '@tabler/icons';
import InputMask from 'react-input-mask';

const reducer = (state, action) => {
	switch (action.type) {
		case 'type':
			return {
				type: action.methodType,
				model: null,
				parameters: {},
				paramsInvalidValue: {},
			};

		case 'model':
			action.inputRefs.current = {};
			console.log(action.parameters);
			for (const [key, _] of Object.entries(action.parameters)) action.inputRefs.current[key] = null;

			return {
				type: state.type,
				model: action.model,
				parameters: action.parameters,
				paramsInvalidValue: {},
			};

		case 'parameter':
			const initialParam = state.parameters;
			const initialParamsInvalidValue = state.paramsInvalidValue;

			initialParam[action.paramName] = action.paramValue;

			if (!action.validityChecker(action.paramValue)) initialParamsInvalidValue[action.paramName] = true;
			else if (action.isRequired && action.paramValue === '') initialParamsInvalidValue[action.paramName] = true;
			else delete initialParamsInvalidValue[action.paramName];

			return {
				type: state.type,
				model: state.model,
				parameters: initialParam,
				paramsInvalidValue: initialParamsInvalidValue,
			};

		case 'reset':
			return {
				type: null,
				model: null,
				parameters: {},
				paramsInvalidValue: {},
			};

		default:
			return state;
	}
};

export default function Settings({ dataset, skipsData }) {
	const [opened, setOpened] = useState(false);
	const [skips, setSkips] = useState(skipsData);
	const [formValues, dispatch] = useReducer(reducer, {
		type: null,
		model: null,
		parameters: {},
		paramsInvalidValue: {},
	});
	const inputRefs = useRef({});

	useEffect(() => {
		// console.log('formValues', formValues);
		// console.log('inputRefs', inputRefs);
		console.log(skips);
	});

	function getParams(model) {
		switch (model) {
			case 'sarima':
				return {
					order: '',
					seasonal_order: '',
					seasonal_period: '',
				};

			case 'simple_es':
				return {
					differencing: '',
					seasonal_differencing: '',
					smoothing_level: '',
				};

			default:
				return {};
		}
	}

	function renderModelParametersForm(model) {
		switch (model) {
			case 'sarima':
				return (
					<div className="flex gap-2 justify-left">
						<Input.Wrapper id="order" label="Order" required>
							<Input
								required
								component={InputMask}
								mask="(9, 9, 9)"
								id="order"
								ref={(ref) => (inputRefs.current['order'] = ref)}
								defaultValue={formValues.parameters['order']}
								placeholder="(p, d, q)"
								onBlur={(e) =>
									dispatch({
										type: 'parameter',
										paramName: 'order',
										paramValue: inputRefs.current['order'].value,
										isRequired: true,
										validityChecker: checkIsValidOrder,
									})
								}
								invalid={formValues.paramsInvalidValue['order']}
							/>
						</Input.Wrapper>
						<Input.Wrapper id="seasonal_order" label="Seasonal Order">
							<Input
								component={InputMask}
								mask="(9, 9, 9)"
								id="seasonal_order"
								ref={(ref) => (inputRefs.current['seasonal_order'] = ref)}
								defaultValue={formValues.parameters['seasonal_order']}
								placeholder="(P, D, Q)"
								onBlur={(e) =>
									dispatch({
										type: 'parameter',
										paramName: 'seasonal_order',
										paramValue: inputRefs.current['seasonal_order'].value,
										validityChecker: checkIsValidOrder,
									})
								}
								invalid={formValues.paramsInvalidValue['seasonal_order']}
							/>
						</Input.Wrapper>
						<Input.Wrapper id="seasonal_period" label="Period">
							<Input
								component={InputMask}
								mask="99"
								maskChar=""
								id="seasonal_period"
								ref={(ref) => (inputRefs.current['seasonal_period'] = ref)}
								defaultValue={formValues.parameters['seasonal_period']}
								placeholder="m"
								className="w-11"
								onBlur={(e) =>
									dispatch({
										type: 'parameter',
										paramName: 'seasonal_period',
										paramValue: inputRefs.current['seasonal_period'].value,
										validityChecker: checkIsPositiveNumber,
									})
								}
								invalid={formValues.paramsInvalidValue['seasonal_period']}
							/>
						</Input.Wrapper>
					</div>
				);

			case 'simple_es':
				return <div></div>;
			default:
				return;
		}
	}

	return (
		<div className="w-[98%] mx-auto mb-2 flex justify-between text-xs overflow-y-clip overflow-x-auto">
			<Modal size="lg" opened={opened} centered onClose={() => setOpened(false)} title="Settings">
				<Divider my="md" label="Data Preparation" />
				<div>
					<div className="mb-2 flex justify-between items-center">
						<Text fz="sm">Drop Cases</Text>
						<Button
							size="xs"
							leftIcon={<IconPlus size={16} />}
							variant="default"
							onClick={() => {
								const temp = [...skips];
								temp.push({ name: '', startDate: null, length: 0 });
								setSkips(temp);
							}}
						>
							Add
						</Button>
					</div>
					{skips.map((skip, idx) => {
						return (
							<div>
								<div className="mb-2 flex justify-between">
									<DateRangePicker
										size="xs"
										icon={<IconCalendarEvent size={18} />}
										maxDate={new Date(dataset.startDate[0], dataset.startDate[1] + dataset.cases.length - 1, 1)}
										minDate={new Date(dataset.startDate[0], dataset.startDate[1] - 1, 1)}
										excludeDate={(date) => date.getDate() !== 1}
										clearable={false}
										placeholder="Pick dates range"
										defaultValue={
											skip.startDate === null
												? [null, null]
												: [
														new Date(...skip.startDate),
														new Date(skip.startDate[0], skip.startDate[1] + skip.length - 1, 0),
												  ]
										}
										// value={dateRange}
										onChange={(value) => {
											if (!value.includes(null)) {
												const temp = [...skips];
												temp[idx].startDate = [value[0].getFullYear(), value[0].getMonth() + 1, 0];
												temp[idx].length = getMonthDifference(value) + 1;
												setSkips(temp);
											}
										}}
										className="w-[50%]"
									/>
									<Input
										component={InputMask}
										id={idx}
										placeholder="Name"
										size="xs"
										className="w-[42%]"
										defaultValue={skip.name}
										onChange={(e) => {
											const temp = [...skips];
											temp[idx].name = e.target.value;
											setSkips(temp);
										}}
									/>
									<ActionIcon
										variant="default"
										size="30px"
										onClick={() => {
											const temp = [...skips];
											temp.splice(idx, 1);
											console.log(temp);
											setSkips(temp);
										}}
									>
										<IconX size={16} />
									</ActionIcon>
								</div>
							</div>
						);
					})}
				</div>
				<Divider my="md" label="Forecasting Model" />
				<div>
					<Select
						className="mb-2"
						label="Type"
						value={formValues.type}
						placeholder="Type"
						data={[
							{ value: 'automatic', label: 'Automatic' },
							{ value: 'manual', label: 'Manual' },
						]}
						onChange={(value) => dispatch({ type: 'type', methodType: value })}
						clearable
					/>
					{formValues.type !== null && (
						<Select
							label="Model"
							value={formValues.model}
							placeholder="Model"
							data={
								formValues.type === 'automatic'
									? [
											{ value: 'auto-arima', label: 'pmdarima.arima.auto_arima', group: 'SARIMA' },
											{ value: 'grid-search', label: 'Grid Search', group: 'SARIMA' },
											{ value: 'simple_es', label: 'Simple Exponential Smoothing', group: 'Exponential Smoothing' },
											{ value: 'double_es', label: "Holt's Exponential Smoothing", group: 'Exponential Smoothing' },
											{
												value: 'triple_es',
												label: "Holt's Winters Exponential Smoothing",
												group: 'Exponential Smoothing',
											},
									  ]
									: [
											{ value: 'sarima', label: 'SARIMA', group: 'SARIMA' },
											{ value: 'simple_es', label: 'Simple Exponential Smoothing', group: 'Exponential Smoothing' },
											{ value: 'double_es', label: "Holt's Exponential Smoothing", group: 'Exponential Smoothing' },
											{
												value: 'triple_es',
												label: "Holt's Winters Exponential Smoothing",
												group: 'Exponential Smoothing',
											},
									  ]
							}
							className="mb-4"
							onChange={(value) =>
								dispatch({ type: 'model', model: value, parameters: getParams(value), inputRefs: inputRefs })
							}
							clearable
						/>
					)}
					{formValues.model !== null && renderModelParametersForm(formValues.model)}
					<div className="w-full mt-8 flex gap-3 justify-end">
						<Button
							size="xs"
							className="px-2 text-slate-500 bg-gray-200 hover:bg-gray-200 rounded font-bold"
							onClick={() => {
								dispatch({ type: 'reset' });
								setSkips(skipsData);
								setOpened(false);
							}}
						>
							Cancel
						</Button>
						<Button
							size="xs"
							className="px-2 bg-slate-500 hover:bg-slate-500 disabled:bg-slate-200 rounded font-bold text-white"
							onClick={() => {
								const tempSkips = [];
								for (const skip of skips) {
									if (skip.startDate !== null) tempSkips.push(skip);
								}

								setSkips(tempSkips);

								for (const [_, value] of Object.entries(inputRefs.current)) {
									value.onFocus();
									value.onBlur();
								}
							}}
						>
							Update Settings
						</Button>
					</div>
				</div>
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

function getMonthDifference([startDate, endDate]) {
	return endDate.getMonth() - startDate.getMonth() + 12 * (endDate.getFullYear() - startDate.getFullYear());
}

function checkIsPositiveNumber(value, isRequired = false) {
	if (!isRequired && value === '') return true;
	const num = parseInt(value);
	return !isNaN(num) && num > 0;
}

function checkIsValidOrder(value, isRequired = false) {
	if (!isRequired && value === '') return true;
	return !value.includes('_') && value !== '';
}
