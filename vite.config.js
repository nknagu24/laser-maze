/* Vite settings for Laser Maze.
   When you run "npm run build", this produces ONE file:
   dist/laser-maze.js — with the CSS packed inside it. */

import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
    plugins: [
        cssInjectedByJsPlugin(),   // puts style.css inside the JS file
    ],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'laser-maze.js',            // name of the final file
                assetFileNames: 'laser-maze-[name].[ext]',
                inlineDynamicImports: true,                 // keep everything in one file
            },
        },
    },
})