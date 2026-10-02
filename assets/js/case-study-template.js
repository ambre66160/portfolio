import { motionPreference } from './motion-preference.js';
import { animate } from 'motion';
import { getProject } from './api.js';

const createElement = (tag, className = '', text) => {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (text !== undefined) element.textContent = text;
	return element;
};

const safeAssetUrl = (value) => {
	if (typeof value !== 'string' || !value) return '';
	try {
		const url = new URL(value, document.baseURI);
		return url.origin === window.location.origin && ['http:', 'https:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
};

const safeExternalUrl = (value) => {
	try {
		const url = new URL(value, document.baseURI);
		return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
};

function updateMetadata(project, imageUrl) {
	document.title = `${project.title} — Étude de cas | Ambre`;
	document.querySelector('meta[name="description"]')?.setAttribute('content', project.subtitle || `Étude de cas du projet ${project.title}.`);
	const canonicalUrl = new URL('projet-detail.html', document.baseURI);
	canonicalUrl.searchParams.set('slug', project.slug);
	document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl.href);
	document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${project.title} — Étude de cas | Ambre`);
	document.querySelector('meta[property="og:description"]')?.setAttribute('content', project.subtitle || 'Étude de cas d’un projet conçu par Ambre.');
	document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl.href);
	if (imageUrl) document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl);

	const structuredData = document.createElement('script');
	structuredData.type = 'application/ld+json';
	structuredData.textContent = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: project.title,
		description: project.subtitle,
		url: canonicalUrl.href,
		image: imageUrl || undefined,
		creator: { '@type': 'Person', name: 'Ambre' },
		keywords: project.technologies,
	});
	document.head.append(structuredData);
}

function makeEyebrow(text) {
	return createElement('p', 'case-eyebrow', text);
}

function makeSectionHeading(section, eyebrow, title, description) {
	const heading = createElement('header', 'case-section__heading');
	heading.append(makeEyebrow(eyebrow), createElement('h2', '', title));
	if (description) heading.append(createElement('p', '', description));
	section.append(heading);
	return heading;
}

function projectActions(project) {
	const links = Array.isArray(project.links) ? project.links : [];
	const demo = safeExternalUrl(project.demo_url || project.live_url)
		|| safeExternalUrl(links.find((link) => /demo|démo|live|site/i.test(link.label || ''))?.url);
	const repository = safeExternalUrl(project.repository_url || project.github_url)
		|| safeExternalUrl(links.find((link) => /github|code source|dépôt|depot/i.test(link.label || '') || /github\.com/i.test(link.url || ''))?.url);
	const actions = [];
	if (demo) actions.push({ label: 'Voir la démo', url: demo, icon: '↗', className: 'case-action--primary' });
	if (repository) actions.push({ label: 'Voir le code', url: repository, icon: 'GH', className: 'case-action--secondary' });
	return actions;
}

function renderHero(project, actions, lightbox) {
	const section = createElement('section', 'case-hero');
	const copy = createElement('div', 'case-hero__copy');
	const back = createElement('a', 'case-back', '← Tous les projets');
	back.href = 'projets.html';
	const heading = createElement('h1', 'case-hero__title', project.title);
	const tagline = createElement('p', 'case-hero__tagline', project.subtitle || 'Une étude de cas, de l’idée aux choix techniques.');
	copy.append(back, makeEyebrow(project.type || 'Étude de cas'), heading, tagline);

	const actionBar = createElement('div', 'case-actions');
	actions.forEach(({ label, url, icon, className }) => {
		const link = createElement('a', `case-action ${className}`);
		link.href = url;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.append(createElement('span', 'case-action__icon', icon), document.createTextNode(label));
		if (icon === '↗') link.setAttribute('aria-label', `${label} (ouvre un nouvel onglet)`);
		actionBar.append(link);
	});
	if (actions.length) copy.append(actionBar);

	section.append(copy);
	const heroImage = safeAssetUrl(project.image_hero);
	const bannerUrl = safeAssetUrl(project.image_banner_webp || project.image_banner);
	const heroUrl = heroImage || bannerUrl;
	if (heroUrl) {
		const figure = createElement('figure', `case-hero__media${project.image_hero_device === 'mobile' && heroImage ? ' case-hero__media--mobile' : ''}`);
		const image = createElement('img');
		image.src = heroUrl;
		image.alt = project.image_hero_alt || project.image_banner_alt || `Aperçu principal de ${project.title}`;
		image.fetchPriority = 'high';
		figure.append(image);
		const preview = createElement('button', 'case-image-preview', 'Agrandir l’image');
		preview.type = 'button';
		preview.setAttribute('aria-label', `Agrandir l’aperçu principal de ${project.title}`);
		preview.addEventListener('click', () => lightbox.open({ src: heroUrl, alt: image.alt, caption: project.subtitle }, preview));
		figure.append(preview);
		section.append(figure);
	}

	const metadata = [
		['Rôle', project.role],
		['Durée / date', project.duration],
		['Type de projet', project.type],
		['Stack principale', (project.technologies || []).join(' · ')],
	].filter(([, value]) => typeof value === 'string' && value.trim());
	if (metadata.length) {
		const grid = createElement('dl', 'case-meta');
		metadata.forEach(([label, value]) => {
			const item = createElement('div', 'case-meta__item');
			item.append(createElement('dt', '', label), createElement('dd', '', value));
			grid.append(item);
		});
		section.append(grid);
	}
	return section;
}

function formatMetricValue(value) {
	const text = String(value ?? '').trim();
	const match = text.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
	if (!match) return { prefix: '', initial: text, suffix: '', numeric: null };
	return {
		prefix: match[1],
		initial: match[2],
		suffix: match[3],
		numeric: Number(match[2].replace(',', '.')),
	};
}

function renderMetrics(project) {
	const metrics = Array.isArray(project.metrics) ? project.metrics.filter((metric) => metric && metric.value !== undefined && metric.label) : [];
	if (!metrics.length) return null;

	const section = createElement('section', 'case-metrics');
	section.setAttribute('aria-label', 'Chiffres clés et impact');
	metrics.forEach((metric) => {
		const card = createElement('article', 'case-metric');
		const parsed = formatMetricValue(metric.value);
		const value = createElement('strong', 'case-metric__value');
		if (parsed.numeric === null) {
			value.textContent = parsed.initial;
		} else {
			value.dataset.prefix = parsed.prefix;
			value.dataset.suffix = parsed.suffix;
			value.dataset.value = String(parsed.numeric);
			value.dataset.decimals = String((parsed.initial.split(/[.,]/)[1] || '').length);
			value.textContent = `${parsed.prefix}0${parsed.suffix}`;
		}
		card.append(value, createElement('p', '', metric.label));
		if (metric.detail) card.append(createElement('small', '', metric.detail));
		section.append(card);
	});
	return section;
}

function startMetricCounters(root) {
	const counters = [...root.querySelectorAll('[data-value]')];
	if (!counters.length) return;
	const reducedMotion = motionPreference.matches;
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			observer.unobserve(entry.target);
			const element = entry.target;
			const target = Number(element.dataset.value);
			const decimals = Number(element.dataset.decimals || 0);
			const render = (value) => {
				const formatted = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
				element.textContent = `${element.dataset.prefix}${formatted}${element.dataset.suffix}`;
			};
			if (reducedMotion) render(target);
			else animate(0, target, { duration: 1, ease: 'easeOut', onUpdate: render });
		});
	}, { threshold: 0.35 });
	counters.forEach((counter) => observer.observe(counter));
	window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

function renderProblemSolution(project) {
	const hasContent = project.context || project.challenge || project.solution;
	if (!hasContent) return null;
	const section = createElement('section', 'case-problem-solution');
	makeSectionHeading(section, 'Comprendre le sujet', 'Le problème et la réponse');
	const grid = createElement('div', 'case-problem-solution__grid');
	if (project.context) {
		const block = createElement('article', 'case-story');
		block.append(makeEyebrow('01 / Besoin initial'), createElement('h3', '', 'Le problème'), createElement('p', '', project.context));
		grid.append(block);
	}
	if (project.challenge) {
		const block = createElement('article', 'case-story case-story--challenge');
		block.append(makeEyebrow('02 / Enjeu de conception'), createElement('h3', '', 'Le défi'), createElement('p', '', project.challenge));
		grid.append(block);
	}
	if (project.solution) {
		const block = createElement('article', 'case-story case-story--solution');
		block.append(makeEyebrow('03 / Réponse'), createElement('h3', '', 'La solution'), createElement('p', '', project.solution));
		grid.append(block);
	}
	section.append(grid);
	return section;
}

function renderObjectives(project) {
	const source = [project.objectives, project.deliverables, project.highlights]
		.find((value) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' && value.trim());
	const items = Array.isArray(source) ? source.filter(Boolean) : typeof source === 'string' && source.trim() ? [source] : [];
	if (!items.length) return null;
	const section = createElement('section', 'case-objectives');
	makeSectionHeading(section, 'Périmètre réalisé', project.objectives ? 'Objectifs' : 'Livrables et fonctionnalités');
	const list = createElement('ul', 'case-objectives__list');
	items.forEach((item) => list.append(createElement('li', '', typeof item === 'string' ? item : item.title || item.label || '')));
	section.append(list);
	return section;
}

const skillMatchers = [
	['Frontend', /react|vue|angular|svelte|html|css|javascript|typescript|tailwind|next\.js/i],
	['Backend & données', /node|nest|express|php|java|python|sql|postgres|mysql|api|flask|jee/i],
	['DevOps / Cloud', /docker|aws|azure|gcp|cloud|linux|bash|ci\/cd|github actions|kubernetes/i],
	['Design / prototypage', /figma|sketch|adobe|ui|ux|prototyp/i],
];

function normalizeSkillGroups(project) {
	const hard = project.skills?.hard || project.hard_skills;
	if (Array.isArray(hard)) {
		return hard.map((group) => ({ category: group.category || group.name || 'Compétences', items: Array.isArray(group.items) ? group.items : [] })).filter((group) => group.items.length);
	}
	if (hard && typeof hard === 'object') {
		return Object.entries(hard).map(([category, items]) => ({ category, items: Array.isArray(items) ? items : [] })).filter((group) => group.items.length);
	}

	const technologies = Array.isArray(project.technologies) ? project.technologies : [];
	const groups = skillMatchers.map(([category]) => ({ category, items: [] }));
	const uncategorized = [];
	technologies.forEach((technology) => {
		const match = skillMatchers.find(([, pattern]) => pattern.test(technology));
		if (match) groups.find((group) => group.category === match[0]).items.push(technology);
		else uncategorized.push(technology);
	});
	if (uncategorized.length) groups.push({ category: 'Stack complémentaire', items: uncategorized });
	return groups.filter((group) => group.items.length);
}

function renderSkills(project) {
	const hardGroups = normalizeSkillGroups(project);
	const softSkills = project.soft_skills || project.skills?.soft || [];
	if (!hardGroups.length && (!Array.isArray(softSkills) || !softSkills.length)) return null;
	const section = createElement('section', 'case-skills');
	makeSectionHeading(section, 'Compétences mobilisées', 'Les outils et les méthodes');
	const grid = createElement('div', 'case-skills__grid');
	hardGroups.forEach((group) => {
		const block = createElement('section', 'case-skill-group');
		block.append(createElement('h3', '', group.category));
		const list = createElement('ul', 'case-skill-list');
		group.items.forEach((item) => list.append(createElement('li', '', typeof item === 'string' ? item : item.name || item.label || '')));
		block.append(list);
		grid.append(block);
	});
	if (Array.isArray(softSkills) && softSkills.length) {
		const block = createElement('section', 'case-skill-group case-skill-group--soft');
		block.append(createElement('h3', '', 'Soft skills'));
		const list = createElement('ul', 'case-skill-list');
		softSkills.forEach((skill) => list.append(createElement('li', '', typeof skill === 'string' ? skill : skill.name || skill.label || '')));
		block.append(list);
		grid.append(block);
	}
	section.append(grid);
	return section;
}

function normalizeGallery(project) {
	if (Array.isArray(project.gallery)) {
		return project.gallery.map((item) => ({
			src: safeAssetUrl(item.src || item.url),
			alt: item.alt || `Capture du projet ${project.title}`,
			caption: item.caption || item.alt || '',
			kind: item.kind || 'screenshot',
			device: ['mobile', 'tablet'].includes(item.device) ? item.device : 'desktop',
		})).filter((item) => item.src);
	}
	return [project.image_hero, project.image_context]
		.filter((src, index, items) => src && items.indexOf(src) === index)
		.map((src, index) => ({
			src: safeAssetUrl(src),
			alt: `Capture ${index + 1} du projet ${project.title}`,
			caption: index === 0 ? `Interface de ${project.title}` : `Détail de ${project.title}`,
			kind: 'screenshot',
			device: project.image_hero_device === 'mobile' && index === 0 ? 'mobile' : 'desktop',
		})).filter((item) => item.src);
}

function createLightbox() {
	const dialog = createElement('dialog', 'case-lightbox');
	dialog.setAttribute('aria-label', 'Aperçu agrandi du projet');
	const close = createElement('button', 'case-lightbox__close', '×');
	close.type = 'button';
	close.setAttribute('aria-label', 'Fermer l’image agrandie');
	const image = createElement('img', 'case-lightbox__image');
	const caption = createElement('p', 'case-lightbox__caption');
	dialog.append(close, image, caption);
	document.body.append(dialog);
	let lastTrigger;
	close.addEventListener('click', () => dialog.close());
	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) dialog.close();
	});
	dialog.addEventListener('close', () => lastTrigger?.focus());
	return {
		open(item, trigger) {
			lastTrigger = trigger;
			image.src = item.src;
			image.alt = item.alt;
			caption.textContent = item.caption;
			dialog.showModal();
		},
	};
}

function galleryFigure(item, index, lightbox) {
	const figure = createElement('figure', `case-gallery-item case-gallery-item--${item.device}`);
	const open = createElement('button', 'case-gallery-item__open');
	open.type = 'button';
	open.setAttribute('aria-label', `Agrandir l’image ${index + 1} : ${item.alt}`);
	const frame = createElement('span', `case-device-frame case-device-frame--${item.device}`);
	if (item.device === 'mobile') frame.append(createElement('span', 'case-device-frame__speaker'));
	else if (item.device === 'desktop') frame.append(createElement('span', 'case-device-frame__toolbar', '●　●　●'));
	const image = createElement('img');
	image.src = item.src;
	image.alt = item.alt;
	image.loading = 'lazy';
	image.decoding = 'async';
	frame.append(image);
	open.append(frame);
	open.addEventListener('click', () => lightbox.open(item, open));
	figure.append(open);
	const caption = createElement('figcaption');
	caption.append(createElement('span', 'case-gallery-item__kind', item.kind), createElement('p', '', item.caption));
	figure.append(caption);
	return figure;
}

function renderGallery(project, lightbox) {
	const items = normalizeGallery(project);
	if (!items.length) return null;
	const section = createElement('section', 'case-gallery-section');
	makeSectionHeading(section, 'Démonstration visuelle', project.gallery_title || 'L’interface en images', project.gallery_description);
	const wireframe = items.find((item) => /wireframe|maquette/i.test(item.kind));
	const final = items.find((item) => /final|rendu/i.test(item.kind));
	const compared = new Set();
	if (wireframe && final) {
		const comparison = createElement('div', 'case-comparison');
		comparison.append(galleryFigure(wireframe, items.indexOf(wireframe), lightbox), galleryFigure(final, items.indexOf(final), lightbox));
		section.append(comparison);
		compared.add(wireframe);
		compared.add(final);
	}
	const remainder = items.filter((item) => !compared.has(item));
	if (remainder.length) {
		const grid = createElement('div', 'case-gallery-grid');
		remainder.forEach((item) => grid.append(galleryFigure(item, items.indexOf(item), lightbox)));
		section.append(grid);
	}
	return section;
}

function architectureData(project) {
	const architecture = project.architecture;
	if (Array.isArray(architecture)) return { summary: '', components: architecture };
	if (architecture && typeof architecture === 'object') {
		return {
			summary: architecture.summary || '',
			components: architecture.components || architecture.steps || [],
		};
	}
	if (typeof architecture === 'string' && architecture.trim()) return { summary: architecture, components: project.approach || [] };
	return { summary: '', components: project.approach || [] };
}

function renderArchitecture(project) {
	const data = architectureData(project);
	if (!data.summary && !data.components.length && !project.code_snippet) return null;
	const section = createElement('section', 'case-architecture');
	makeSectionHeading(section, 'Profondeur technique', 'Architecture et méthodologie', data.summary);
	if (data.components.length) {
		const flow = createElement('ol', 'case-architecture__flow');
		data.components.forEach((component, index) => {
			const name = typeof component === 'string' ? component : component.title || component.name || component.label || `Étape ${index + 1}`;
			const description = typeof component === 'string' ? '' : component.description || component.role || '';
			const item = createElement('li', 'case-architecture__step');
			item.append(createElement('span', 'case-architecture__number', String(index + 1).padStart(2, '0')), createElement('h3', '', name));
			if (description) item.append(createElement('p', '', description));
			flow.append(item);
		});
		section.append(flow);
	}
	if (project.code_snippet) {
		const code = createElement('details', 'case-code');
		const summary = createElement('summary', '', 'Voir un extrait de code');
		const pre = createElement('pre');
		pre.tabIndex = 0;
		pre.append(createElement('code', '', project.code_snippet));
		code.append(summary, pre);
		section.append(code);
	}
	return section;
}

function renderNextProject(project, next) {
	if (!next) return null;
	const banner = createElement('section', 'case-next-project');
	banner.setAttribute('aria-labelledby', 'case-next-title');
	const link = createElement('a', 'case-next-project__link');
	link.href = `projet-detail.html?slug=${encodeURIComponent(next.slug)}`;
	const title = createElement('h2', '', next.title);
	title.id = 'case-next-title';
	link.append(createElement('span', 'case-next-project__eyebrow', 'Projet suivant'), title, createElement('span', 'case-next-project__action', 'Découvrir le projet →'));
	const imageUrl = safeAssetUrl(next.image_hero || next.image_banner_webp || next.image_banner);
	if (imageUrl) {
		const image = createElement('img', 'case-next-project__image');
		image.src = imageUrl;
		image.alt = '';
		image.loading = 'lazy';
		image.decoding = 'async';
		link.prepend(image);
	} else {
		link.prepend(createElement('span', 'case-next-project__placeholder', Array.from(next.title || '?')[0] || '?'));
	}
	if (project.title) link.setAttribute('aria-label', `Projet suivant : ${next.title}`);
	banner.append(link);
	return banner;
}

function updateStructuredData(project, imageUrl) {
	const canonicalUrl = new URL('projet-detail.html', document.baseURI);
	canonicalUrl.searchParams.set('slug', project.slug);
	const script = document.createElement('script');
	script.type = 'application/ld+json';
	script.textContent = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: project.title,
		description: project.subtitle,
		url: canonicalUrl.href,
		image: imageUrl || undefined,
		creator: { '@type': 'Person', name: 'Ambre' },
		keywords: project.technologies,
	});
	document.head.append(script);
}

async function renderProject(project, root) {
	const content = root.querySelector('[data-project-content]');
	const lightbox = createLightbox();
	const page = createElement('div', 'case-template');
	const heroImage = safeAssetUrl(project.image_banner_webp || project.image_banner || project.image_hero);
	const actions = projectActions(project);
	page.append(renderHero(project, actions, lightbox));
	const metrics = renderMetrics(project);
	if (metrics) page.append(metrics);
	const problemSolution = renderProblemSolution(project);
	if (problemSolution) page.append(problemSolution);
	const objectives = renderObjectives(project);
	if (objectives) page.append(objectives);
	const skills = renderSkills(project);
	if (skills) page.append(skills);
	const gallery = renderGallery(project, lightbox);
	if (gallery) page.append(gallery);
	const architecture = renderArchitecture(project);
	if (architecture) page.append(architecture);

	if (project.next_project_slug) {
		try {
			const next = await getProject(project.next_project_slug);
			const nextSection = renderNextProject(project, next);
			if (nextSection) page.append(nextSection);
		} catch {
			// The current case study remains complete if the next project is unavailable.
		}
	}

	content.replaceChildren(page);
	content.hidden = false;
	root.setAttribute('aria-busy', 'false');
	startMetricCounters(page);
}

async function initializeCaseStudy() {
	const root = document.querySelector('[data-project-detail]');
	if (!root) return;
	const loading = root.querySelector('[data-project-loading]');
	const errorView = root.querySelector('[data-project-error]');
	const message = errorView.querySelector('[data-error-message]');
	root.setAttribute('aria-busy', 'true');
	const slug = new URLSearchParams(window.location.search).get('slug');

	try {
		if (!slug) throw new Error('Cette fiche projet n’existe pas.');
		const project = await getProject(slug);
		const imageUrl = safeAssetUrl(project.image_hero || project.image_banner_webp || project.image_banner);
		document.title = `${project.title} — Étude de cas | Ambre`;
		document.body.classList.toggle('case-study--marmiton', project.slug === 'marmiton-numerique');
		document.querySelector('meta[name="description"]')?.setAttribute('content', project.subtitle || `Étude de cas du projet ${project.title}.`);
		const canonicalUrl = new URL('projet-detail.html', document.baseURI);
		canonicalUrl.searchParams.set('slug', project.slug);
		document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl.href);
		document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${project.title} — Étude de cas | Ambre`);
		document.querySelector('meta[property="og:description"]')?.setAttribute('content', project.subtitle || `Étude de cas du projet ${project.title}.`);
		document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl.href);
		if (imageUrl) document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl);
		updateStructuredData(project, imageUrl);
		await renderProject(project, root);
	} catch (error) {
		message.textContent = error.status === 404 ? 'Ce projet est introuvable.' : error.message;
		errorView.hidden = false;
		root.setAttribute('aria-busy', 'false');
	} finally {
		loading.hidden = true;
	}
}

initializeCaseStudy();