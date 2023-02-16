/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {
			animation: {
				'bounce-middle-main': 'bounce-middle-main 0.6s ease 0.1s infinite',
				'bounce-middle-before': 'bounce-middle-main 0.6s ease 0s infinite',
				'bounce-middle-after': 'bounce-middle-main 0.6s ease 0.2s infinite',
			},
			keyframes: {
				'bounce-middle-main': {
					'0%, 100%': { height: '4px', marginTop: '8px', marginBottom: '8px' },
					'50%': { height: '20px', marginTop: '0px', marginBottom: '0px' },
				},
			},
		},
		backgroundImage: {
			'gradient-radial': 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
		},
		backgroundSize: {
			40: '40px 40px',
		},
		fontFamily: {
			helvetica: 'Helvetica, Arial, sans-serif',
		},
	},
	plugins: [
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					'translate-z': (value) => ({
						'--tw-translate-z': value,
						transform: ` translate3d(var(--tw-translate-x), var(--tw-translate-y), var(--tw-translate-z)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))`,
					}), // this is actual CSS
				},
				{ values: theme('translate'), supportsNegativeValues: true }
			);
		}),
	],
	variants: {
		extend: {
			opacity: ['disabled'],
			boxShadow: ['responsive', 'hover', 'focus'],
		},
	},
};
