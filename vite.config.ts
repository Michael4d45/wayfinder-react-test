import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { run } from 'vite-plugin-run';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),

        // Wayfinder integration that works in both dev and build
        {
            name: 'wayfinder-generator',
            // This runs before the build starts in production mode
            buildStart() {
                console.log('Generating Wayfinder TypeScript files for production build...');
                try {
                    execSync('php artisan wayfinder:generate', {
                        stdio: 'inherit',
                    });
                    console.log('Wayfinder generation complete.');
                } catch (error) {
                    console.error('Error generating Wayfinder files:', error);
                    throw error; // Fail the build if generation fails
                }
            },
        },

        // This will continue handling dev mode file changes
        run({
            name: 'wayfinder',
            pattern: ['routes/**/*.php', 'app/**/Http/**/*.php'],
            onFileChanged: ({ file }) => {
                console.log(`File changed: ${file}, generating routes...`);
                try {
                    // This runs synchronously and will block until complete
                    execSync('php artisan wayfinder:generate --path=resources/js --with-form', {
                        stdio: 'inherit',
                    });
                    console.log('Routes generated successfully');
                } catch (error) {
                    console.error('Error generating routes:', error);
                }
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
