import { requestJson } from './api.js';

const element = (tag, className, text) => {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
};

const safeAssetUrl = (value) => {
	if (typeof value !== 'string' || value === '') return '';
	try {
		const url = new URL(value, document.baseURI);
		return url.origin === window.location.origin && ['http:', 'https:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
};

const projectUrl = (slug) => `projet-detail.html?slug=${encodeURIComponent(slug)}`;

function technologyTags(technologies = []) {
	const tags = element('div', 'tag-list');
	technologies.forEach((technology) => tags.append(element('span', '', technology)));
	return tags;
}

function featuredCard(project) {
	const article = element('article', 'project-card');
	const imageUrl = safeAssetUrl(project.image_hero);
	if (imageUrl) {
		const art = element('div', 'project-art project-art--eco project-art--data');
		const image = element('img');
		image.src = imageUrl;
		image.alt = '';
		image.loading = 'lazy';
		image.decoding = 'async';
		art.append(image, element('span', 'project-art__wordmark', project.title));
		article.append(art);
	} else {
		const art = element('div', 'project-art project-art--placeholder');
		art.setAttribute('role', 'img');
		art.setAttribute('aria-label', `Aperçu du projet ${project.title}`);
		art.append(element('span', '', Array.from(project.title || '?')[0] || '?'));
		art.append(element('strong', '', project.title), element('small', '', project.type));
		article.append(art);
	}

	const body = element('div', 'project-card__body');
	const meta = element('div', 'project-card__meta');
	meta.append(element('span', '', project.type), element('span', '', project.duration || ''));
	body.append(meta, element('h3', '', project.title), element('p', 'project-card__role', project.role), element('p', '', project.subtitle), technologyTags(project.technologies));
	const link = element('a', 'button button--project');
	link.href = projectUrl(project.slug);
	link.append(document.createTextNode('Découvrir le projet '), element('span', '', '↗'));
	link.lastElementChild.setAttribute('aria-hidden', 'true');
	body.append(link);
	article.append(body);
	return article;
}

function projectListCard(project, index) {
	const article = element('article', `project-card project-card--${String(project.slug).replace(/[^a-z0-9-]/g, '')}`);
	const visual = element('div', project.image_hero ? 'project-card__visual project-card__visual--image' : `project-card__visual project-card__visual--placeholder project-card__visual--${String(project.slug).replace(/[^a-z0-9-]/g, '')}`);
	const imageUrl = safeAssetUrl(project.image_hero);
	if (imageUrl) {
		const image = element('img');
		image.src = imageUrl;
		image.alt = `Aperçu du projet ${project.title}`;
		image.loading = 'lazy';
		image.decoding = 'async';
		visual.append(image);
	} else {
		visual.setAttribute('role', 'img');
		visual.setAttribute('aria-label', `Aperçu graphique de ${project.title}`);
		visual.append(element('span', 'project-placeholder__index', `${String(index + 1).padStart(2, '0')} / ÉTUDE DE CAS`), element('strong', '', project.title));
	}
	const caption = element('span', 'project-card__visual-caption', `${project.type} · ${project.duration || ''}`);
	visual.append(caption);

	const content = element('div', 'project-card__content');
	const meta = element('div', 'project-card__meta');
	meta.append(element('span', '', `${String(index + 1).padStart(2, '0')} / ${project.type}`), element('span', 'project-card__meta-dot'));
	const technologies = element('ul', 'project-card__stack');
	technologies.setAttribute('aria-label', 'Technologies utilisées');
	(project.technologies || []).forEach((technology) => technologies.append(element('li', '', technology)));
	const detailLink = element('a', 'project-detail-link');
	detailLink.href = projectUrl(project.slug);
	detailLink.append(document.createTextNode("Lire l'étude de cas "), element('span', '', '→'));
	detailLink.lastElementChild.setAttribute('aria-hidden', 'true');
	content.append(meta, element('h2', '', project.title), element('p', 'project-card__role', project.role), element('p', 'project-card__description', project.subtitle), technologies, detailLink);

	(project.links || []).forEach((item) => {
		const linkUrl = safeExternalUrl(item.url);
		if (!linkUrl) return;
		const link = element('a', 'project-detail-link');
		link.href = linkUrl;
		link.target = '_blank';
		link.rel = 'noreferrer';
		link.append(document.createTextNode(`${item.label} `), element('span', '', '↗'));
		link.lastElementChild.setAttribute('aria-hidden', 'true');
		content.append(link);
	});
	article.append(visual, content);
	return article;
}

function safeExternalUrl(value) {
	try {
		const url = new URL(value);
		return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
}

async function render(root, featuredOnly) {
	root.classList.add('is-loading');
	root.setAttribute('aria-busy', 'true');
	try {
		const projects = await requestJson('/api/projects.php');
		const visibleProjects = featuredOnly
			? ['ekoroji', 'atelier', 'ambre-portfolio'].map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean)
			: projects;
		const fragment = document.createDocumentFragment();
		visibleProjects.forEach((project, index) => fragment.append(featuredOnly ? featuredCard(project) : projectListCard(project, index)));
		root.replaceChildren(fragment);
		root.classList.toggle('is-empty', visibleProjects.length === 0);
		root.classList.remove('is-error');
		const count = document.querySelector('[data-project-count]');
		if (count) count.textContent = `01 / ${String(projects.length).padStart(2, '0')} projets`;
	} catch (error) {
		root.replaceChildren(element('p', 'data-message', error.message));
		root.classList.add('is-error');
	} finally {
		root.classList.remove('is-loading');
		root.setAttribute('aria-busy', 'false');
	}
}

const featuredRoot = document.querySelector('[data-featured-projects]');
if (featuredRoot) render(featuredRoot, true);

const allProjectsRoot = document.querySelector('[data-project-list]');
if (allProjectsRoot) render(allProjectsRoot, false);
