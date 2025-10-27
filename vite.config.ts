import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: '/finance-tracker/',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@store': path.resolve(__dirname, './src/store'),
			'@hooks': path.resolve(__dirname, './src/hooks'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@theme': path.resolve(__dirname, './src/theme'),
			'@db': path.resolve(__dirname, './src/db'),
		},
	},
});
