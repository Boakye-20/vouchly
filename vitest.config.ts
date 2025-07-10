import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        coverage: {
            reporter: ['text', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        },
    },
}); 