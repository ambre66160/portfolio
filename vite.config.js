import { defineConfig } from 'vite';
import { motionStudio } from 'motion-studio';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const copyProjectImages = {
    name: 'copy-project-images',
    apply: 'build',
    writeBundle() {
        const projects = JSON.parse(readFileSync(resolve('config/projets.json'), 'utf8'));
        const imagePaths = new Set(projects.flatMap((project) =>
            Object.entries(project)
                .filter(([key, value]) => key.startsWith('image_') && typeof value === 'string' && value.startsWith('assets/images/'))
                .map(([, value]) => value),
        ));

        imagePaths.forEach((imagePath) => {
            const outputPath = resolve('dist', imagePath);
            mkdirSync(dirname(outputPath), { recursive: true });
            copyFileSync(resolve(imagePath), outputPath);
        });
    },
};

export default defineConfig({
    plugins: [motionStudio(), copyProjectImages],
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
        rollupOptions: {
            input: {
                index: 'index.html',
                projets: 'projets.html',
                'qui-suis-je': 'qui-suis-je.html',
                competences: 'competences.html',
                contact: 'contact.html',
                'projet-detail': 'projet-detail.html',
            },
        },
    },
});
