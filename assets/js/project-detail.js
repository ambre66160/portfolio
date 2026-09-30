import { getProject } from './api.js';

const node = (tag, className = '', text) => {
	const result = document.createElement(tag);
	if (className) result.className = className;
	if (text !== undefined) result.textContent = text;
	return result;
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

const safeExternalUrl = (value) => {
	try {
		const url = new URL(value);
		return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
};

function eyebrow(number, label) {
	const result = node('p', 'project-eyebrow');
	result.append(document.createTextNode(`${number} `), node('span', '', '/'), document.createTextNode(` ${label}`));
	return result;
}

async function renderProject(project, content) {
	const fragment = document.createDocumentFragment();
	const container = node('div', 'case-study__container');
	const hero = node('section', 'project-hero');
	hero.setAttribute('aria-labelledby', 'project-title');
	hero.append(eyebrow('Détail du projet', 'Étude de cas'));
	const title = node('h1');
	title.id = 'project-title';
	title.append(document.createTextNode(project.title), node('span', '', '.'));
	hero.append(title, node('p', 'project-hero__subtitle', project.subtitle));

	const meta = node('dl', 'project-meta');
	meta.setAttribute('aria-label', 'Informations sur le projet');
	[['Rôle', project.role], ['Durée', project.duration], ['Technologies', (project.technologies || []).join(', ')], ['Typologie', project.type]].forEach(([label, value]) => {
		const item = node('div');
		item.append(node('dt', '', label), node('dd', '', value));
		meta.append(item);
	});

	const visual = node('figure', 'project-hero__visual');
	const bannerUrl = safeAssetUrl(project.image_banner_webp || project.image_banner);
	const heroUrl = safeAssetUrl(project.image_hero);
	if (bannerUrl) {
		visual.classList.add('project-hero__visual--animated');
		visual.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.4)), url("${bannerUrl}")`;
	} else if (heroUrl) {
		const image = node('img');
		image.src = heroUrl;
		image.alt = `Aperçu de ${project.title}`;
		image.fetchPriority = 'high';
		visual.append(image);
	} else {
		visual.classList.add('project-hero__visual--placeholder');
		const placeholder = node('div', 'project-visual-placeholder');
		placeholder.setAttribute('aria-hidden', 'true');
		placeholder.append(node('span', '', Array.from(project.title)[0] || '?'), node('strong', '', project.title), node('small', '', project.type));
		visual.append(placeholder);
	}
	const overlay = node('div', `project-hero__overlay${bannerUrl ? ' project-hero__overlay--center' : ''}`);
	overlay.append(node('span', '', project.type.toUpperCase()), node('h2', '', project.title), node('p', 'project-hero__overlay-subtitle', project.duration));
	visual.append(overlay, node('figcaption', '', `${project.title} — ${project.subtitle}`));
	container.append(hero, meta, visual);

	if (project.metrics?.length) {
		const metrics = node('section', 'project-metrics');
		metrics.setAttribute('aria-label', 'Chiffres clés du projet');
		project.metrics.forEach((metric) => {
			const card = node('article', 'metric-card');
			card.append(node('strong', '', metric.value), node('p', '', metric.label));
			metrics.append(card);
		});
		container.append(metrics);
	}

	if (project.highlights?.length) {
		const highlights = node('section', 'project-highlights');
		highlights.setAttribute('aria-labelledby', 'highlights-title');
		highlights.append(node('h2', '', 'Fonctionnalités clés'));
		highlights.querySelector('h2').id = 'highlights-title';
		const list = node('ul');
		project.highlights.forEach((highlight) => list.append(node('li', '', highlight)));
		highlights.append(list);
		container.append(highlights);
	}

	if (project.links?.length) {
		const links = node('nav', 'project-links');
		links.setAttribute('aria-label', 'Ressources du projet');
		project.links.forEach((item) => {
			const url = safeExternalUrl(item.url);
			if (!url) return;
			const link = node('a');
			link.href = url;
			link.target = '_blank';
			link.rel = 'noreferrer';
			link.append(document.createTextNode(`${item.label} `), node('span', '', '↗'));
			link.lastElementChild.setAttribute('aria-hidden', 'true');
			links.append(link);
		});
		if (links.childElementCount) container.append(links);
	}

	const context = node('section', 'project-context');
	context.setAttribute('aria-labelledby', 'context-title');
	const contextCopy = node('div', 'project-copy');
	contextCopy.append(eyebrow('01', 'Le point de départ'));
	const contextTitle = node('h2', '', 'Le contexte & le problème');
	contextTitle.id = 'context-title';
	contextCopy.append(contextTitle, node('p', '', project.context));
	const contextImageUrl = safeAssetUrl(project.image_context);
	let contextVisual;
	if (contextImageUrl) {
		contextVisual = node('figure', 'project-context__visual');
		const image = node('img');
		image.src = contextImageUrl;
		image.alt = `Aperçu de la solution ${project.title}`;
		image.loading = 'lazy';
		image.decoding = 'async';
		contextVisual.append(image, node('figcaption', '', 'Une expérience claire, au service des usages.'));
	} else {
		contextVisual = node('div', 'project-context__visual project-context__visual--inventory');
		contextVisual.setAttribute('role', 'img');
		contextVisual.setAttribute('aria-label', `Illustration synthétique du contexte ${project.title}`);
		contextVisual.append(node('span', '', project.type.toUpperCase()), node('strong', '', project.title));
		[[project.technologies?.[0] || 'Projet', project.role], [project.duration, project.type]].forEach(([value, label]) => {
			const item = node('div');
			item.append(node('i'), node('b', '', value), node('small', '', label));
			contextVisual.append(item);
		});
	}
	context.append(contextCopy, contextVisual);
	container.append(context);

	const approach = node('section', 'project-approach');
	approach.setAttribute('aria-labelledby', 'approach-title');
	const approachHeading = node('header', 'project-section-heading');
	approachHeading.append(eyebrow('02', 'Concevoir avec intention'));
	const approachTitle = node('h2', '', 'La démarche & les choix techniques');
	approachTitle.id = 'approach-title';
	approachHeading.append(approachTitle, node('p', '', 'Des décisions techniques alignées sur les besoins du projet et de ses utilisateurs.'));
	const approachGrid = node('div', 'approach-grid');
	(project.approach || []).forEach((item, index) => {
		const card = node('article', 'approach-card');
		card.append(node('span', '', String(index + 1).padStart(2, '0')), node('h3', '', item.title), node('p', '', item.description));
		approachGrid.append(card);
	});
	approach.append(approachHeading, approachGrid);
	if (project.code_snippet) {
		const codeBlock = node('div', 'code-block');
		codeBlock.setAttribute('aria-label', 'Extrait de code');
		const bar = node('div', 'code-block__bar');
		bar.setAttribute('aria-hidden', 'true');
		bar.append(node('span'), node('span'), node('span'), node('p', '', `${project.slug}.snippet`));
		const pre = node('pre');
		pre.tabIndex = 0;
		pre.append(node('code', '', project.code_snippet));
		codeBlock.append(bar, pre);
		approach.append(codeBlock);
	}
	container.append(approach);

	const challenge = node('section', 'project-challenge');
	const challengeCopy = node('div', 'project-copy');
	challengeCopy.append(eyebrow('03', "Résoudre l'essentiel"));
	challengeCopy.append(node('h2', '', 'Le défi majeur & la solution'), node('p', '', project.challenge), node('p', '', project.solution));
	const learningStack = node('div', 'learning-stack');
	const learnings = [
		['Ce que j’ai appris', 'La cohérence se construit dans les détails.', 'Une architecture utile rend les prochaines décisions et évolutions plus simples.', 'learning-card'],
		["L'impact à long terme", 'Une expérience bien pensée accompagne les usages.', 'Un produit réussi reste utile, clair et agréable à utiliser dans la durée.', 'learning-card learning-card--accent'],
	];
	learnings.forEach(([label, heading, description, className]) => {
		const card = node('article', className);
		card.append(node('span', '', label), node('h3', '', heading), node('p', '', description));
		learningStack.append(card);
	});
	challenge.append(challengeCopy, learningStack);
	container.append(challenge);
	fragment.append(container);
	content.replaceChildren(fragment);

	if (project.next_project_slug) {
		try {
			const next = await getProject(project.next_project_slug);
			const banner = node('section', 'next-project-banner');
			banner.setAttribute('aria-labelledby', 'next-project-title');
			const inner = node('div', 'next-project-banner__inner');
			inner.append(node('p', '', 'Projet suivant ↗'));
			const nextTitle = node('h2');
			nextTitle.id = 'next-project-title';
			nextTitle.textContent = `${next.title} — ${next.subtitle}`;
			const link = node('a');
			link.href = `projet-detail.html?slug=${encodeURIComponent(next.slug)}`;
			link.append(document.createTextNode('Voir le projet '), node('span', '', '→'));
			inner.append(nextTitle, link);
			banner.append(inner);
			content.append(banner);
		} catch {
			// Le détail reste utilisable si le projet suivant n'est pas disponible.
		}
	}
}

const root = document.querySelector('[data-project-detail]');
if (root) {
	const loading = root.querySelector('[data-project-loading]');
	const errorView = root.querySelector('[data-project-error]');
	const content = root.querySelector('[data-project-content]');
	const params = new URLSearchParams(window.location.search);
	const slug = params.get('slug');
	root.setAttribute('aria-busy', 'true');
	try {
		if (!slug) throw new Error('Cette fiche projet n’existe pas.');
		const project = await getProject(slug);
		document.title = `${project.title} — Étude de cas | Ambre`;
		document.body.classList.toggle('case-study--marmiton', project.slug === 'marmiton-numerique');
		document.querySelector('meta[name="description"]')?.setAttribute('content', project.subtitle);
		await renderProject(project, content);
		content.hidden = false;
	} catch (error) {
		const message = errorView.querySelector('[data-error-message]');
		message.textContent = error.status === 404 ? 'Ce projet est introuvable.' : error.message;
		errorView.hidden = false;
	}
	loading.hidden = true;
	root.setAttribute('aria-busy', 'false');
}
