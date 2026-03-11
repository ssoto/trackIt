import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/unit/setup.ts'],
        include: ['components/**/*.steps.tsx'],
        exclude: ['node_modules', '.features-gen', 'tests/e2e'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
        },
    },
});
