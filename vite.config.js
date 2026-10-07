import { defineConfig } from 'vite';
import { motionStudio } from 'motion-studio';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const IMAGE_PREFIX = 'assets/images/';
const PROJECTS_PATH = 'config/projets.json';
const SECURITY_POLICY = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
    "img-src 'self' https://images.unsplash.com data: blob:",
    "connect-src 'self' https://api.emailjs.com",
    "upgrade-insecure-requests",
].join('; ');

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
                    ...(Array.isArray(project.gallery)
                        ? project.gallery.map((item) => typeof item === 'string' ? item : item.src || item.url)
                        : []),
                ])
                .filter((imagePath) => typeof imagePath === 'string' && imagePath.startsWith(IMAGE_PREFIX)),
        );

        imagePaths.forEach(copyToDist);
        copyToDist(PROJECTS_PATH);
    },
};

const securityMetadata = {
    name: 'security-metadata',
    apply: 'build',
    transformIndexHtml: {
        order: 'pre',
        handler(html) {
            const metadata = [
                `<meta http-equiv="Content-Security-Policy" content="${SECURITY_POLICY}">`,
                '<meta name="referrer" content="strict-origin-when-cross-origin">',
            ].join('\n    ');
            return html.replace('<head>', `<head>\n    ${metadata}`);
        },
    },
};

const pages = Object.fromEntries(
    readdirSync('.')
        .filter((file) => file.endsWith('.html'))
        .map((file) => [basename(file, '.html'), file]),
);

const cleanPageRoutes = {
    name: 'clean-page-routes',
    configureServer(server) {
        const routeNames = new Set(Object.keys(pages).filter((name) => name !== 'index'));
        server.middlewares.use((request, _response, next) => {
            if (!request.url) return next();
            const url = new URL(request.url, 'http://localhost');
            const routeName = url.pathname.split('/').filter(Boolean).at(-1);
            if (routeNames.has(routeName) && !url.pathname.endsWith('.html')) {
                request.url = `${url.pathname.replace(/\/+$/, '')}.html${url.search}`;
            }
            next();
        });
    },
    transformIndexHtml(html, context) {
        const metadata = [
            ...(context.server ? ['<base href="/">'] : []),
            '<link rel="icon" type="image/svg+xml" href="favicon.svg">',
        ].join('\n    ');
        return html.replace('<head>', `<head>\n    ${metadata}`);
    },
    writeBundle() {
        Object.keys(pages).filter((name) => name !== 'index').forEach((name) => {
            const outputPath = resolve('dist', `${name}.html`);
            const routeIndex = resolve('dist', name, 'index.html');
            const html = readFileSync(outputPath, 'utf8').replace('<head>', '<head>\n    <base href="../">');
            mkdirSync(dirname(routeIndex), { recursive: true });
            writeFileSync(routeIndex, html);
        });
    },
};

export default defineConfig({
    base: './',
    plugins: [motionStudio(), copyProjectData, securityMetadata, cleanPageRoutes],
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
