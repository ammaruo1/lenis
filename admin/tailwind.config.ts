import type { Config } from 'tailwindcss';
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], darkMode: 'class', theme: { extend: { colors: { primary: '#322F83', secondary: '#5C4999', signal: '#F2A93B' } } }, plugins: [] } satisfies Config;
