import { defineConfig } from 'vite';
import { motionStudio } from 'motion-studio';
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const IMAGE_PREFIX = 'assets/images/';
const PROJECTS_PATH = 'config/projets.json';

const copyToDist = (relativePath) => {
    const outputPath = resolve('dist', relativePath);
    mkdirSync(dirname(outputPath), { recursive: true });
    copyFileSync(resolve(relativePath), outputPath);
};

// Les images et le JSON des projets sont chargés à l'exécution : Vite ne les voit pas.
const copyProjectData = {
    name: 'copy-project-data',
    apply: 'build',
    writeBundle() {
        const projects = JSON.parse(readFileSync(resolve(PROJECTS_PATH), 'utf8'));
        const imagePaths = new Set(
            projects
                .flatMap((project) => [
                    ...Object.entries(project)
                        .filter(([key]) => key.startsWith('image_'))
                        .map(([, value]) => value),
                    ...(Array.isArray(project.gallery) ? project.gallery.map((item) => item.src) : []),
                ])
                .filter((imagePath) => typeof imagePath === 'string' && imagePath.startsWith(IMAGE_PREFIX)),
        );

        imagePaths.forEach(copyToDist);
        copyToDist(PROJECTS_PATH);
    },
};

const pages = Object.fromEntries(
    readdirSync('.')
        .filter((file) => file.endsWith('.html'))
        .map((file) => [basename(file, '.html'), file]),
);

export default defineConfig({
    base: './',
    plugins: [motionStudio(), copyProjectData],
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8001',
                changeOrigin: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: { input: pages },
    },
});
