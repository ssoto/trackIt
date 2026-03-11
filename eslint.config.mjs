import nextConfig from 'eslint-config-next';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const coreWebVitals = require('eslint-config-next/dist/core-web-vitals.js');

export default [
    ...nextConfig,
    ...coreWebVitals,
    {
        ignores: ['components/**/*.steps.tsx', 'tests/**', '.features-gen/**', 'node_modules/**'],
    },
];
