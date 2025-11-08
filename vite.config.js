import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import fg from "fast-glob";

const pageEntries = fg.sync([
    "resources/css/**/*.css",
    "resources/scss/pages/**/*.scss",
    "resources/scss/admin/pages/**/*.scss",
    "resources/js/**/*.js",
    "resources/ts/pages/*.ts",
]);

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.js",
                "resources/scss/app.scss",
                "resources/scss/admin.scss",
                ...pageEntries,
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});
