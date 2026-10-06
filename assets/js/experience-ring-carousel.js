import * as THREE from 'three';
import { motionPreference } from './motion-preference.js';

const CARD_WIDTH = 3.1;
const CARD_HEIGHT = 4.25;
const clampIndex = (index, length) => Math.min(length - 1, Math.max(0, index));
const mod = (value, length) => ((value % length) + length) % length;

const details = {
	notipro: {
		title: 'Stage Développeuse Full Stack & IA — NOTIPRO',
		meta: 'Stagiaire Développeuse Full Stack, UI/UX & Vision par Ordinateur · Juin—Août 2026 · Pau',
		sections: [
			['Application web gamifiée', ['Plateforme web d’entreprise avec mécaniques de gamification pour stimuler l’engagement utilisateur.', 'Conception du design system et intégration UI/UX responsive complète.']],
			['Projet expérimental IA & échecs', ['Analyse et numérisation de feuilles de parties manuscrites avec vision par ordinateur.', 'Validation des scoresheets dans une boucle human-in-the-loop.']],
		],
	},
	dga: {
		title: 'Vacataire Sécurité & Audit — DGA E.M',
		meta: 'Service Sécurité · Ministère des Armées · Juillet 2025 · Saint-Médard-en-Jalles',
		sections: [['Missions', ['Recensement et cartographie des bâtiments et locaux sécurisés.', 'Audit physique des installations, pose de scellés et contrôle des accès.', 'Identification des centrales d’alarme et retrait des signalétiques non homologuées.', 'Respect strict des protocoles de confidentialité et de sécurité défense.']]],
	},
	salon: {
		title: 'Développeuse Web & Brand Designer — Salon de coiffure',
		meta: 'Freelance · Client indépendant · Mai 2025 · 68 rue Carnot, Pau',
		sections: [['Missions', ['Refonte intégrale de l’interface web en PHP, HTML, CSS et JavaScript.', 'Création de la charte graphique, des logos et de contenus pour les réseaux sociaux.', 'Cadrage du besoin, vulgarisation et accompagnement d’un client non-technique.', 'Pilotage autonome du projet, du besoin au déploiement.']]],
	},
};

function readExperience(card, index) {
	const title = card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() || 'Expérience professionnelle';
	const eyebrow = [...card.querySelectorAll('.experience-card__eyebrow span')];
	const highlights = [...card.querySelectorAll('.experience-card__projects p, .experience-card__highlights li')].map((item) => item.textContent.trim());
	const technologies = [...card.querySelectorAll('.experience-card__tags li')].map((item) => item.textContent.trim());
	return {
		key: card.dataset.experienceKey,
		title,
		place: eyebrow[1]?.textContent.trim() || '',
		role: card.querySelector('.experience-card__role')?.textContent.trim() || '',
		period: card.querySelector('.experience-card__period')?.textContent.trim() || '',
		summary: highlights[0] || card.querySelector('.experience-card__role')?.textContent.trim() || '',
		technologies,
		index,
	};
}

function createTexture(experience, index) {
	const canvas = document.createElement('canvas');
	canvas.width = 744;
	canvas.height = 1020;
	const context = canvas.getContext('2d');
	const palettes = [
		['#244b42', '#e8a17d'],
		['#292e3b', '#dda78c'],
		['#5a3643', '#e6b879'],
	];
	const [base, accent] = palettes[index % palettes.length];
	const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
	background.addColorStop(0, base);
	background.addColorStop(1, '#171c1a');
	context.fillStyle = background;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = 'rgba(255, 250, 241, 0.12)';
	context.lineWidth = 2;
	for (let x = 0; x < canvas.width; x += 54) {
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x, canvas.height);
		context.stroke();
	}
	context.fillStyle = accent;
	context.fillRect(54, 62, 76, 8);
	context.fillStyle = 'rgba(255, 250, 241, 0.65)';
	context.font = '600 21px "Plus Jakarta Sans", sans-serif';
	context.fillText(`EXPÉRIENCE 0${index + 1}`, 54, 116);
	context.fillStyle = '#fffaf1';
	context.font = '600 58px "Playfair Display", Georgia, serif';
	const words = experience.title.split(/\s+/);
	const lines = [];
	let line = '';
	words.forEach((word) => {
		const candidate = line ? `${line} ${word}` : word;
		if (context.measureText(candidate).width > canvas.width - 108 && line) {
			lines.push(line);
			line = word;
		} else line = candidate;
	});
	if (line) lines.push(line);
	lines.slice(0, 4).forEach((text, lineIndex) => context.fillText(text, 54, 350 + lineIndex * 70));
	context.fillStyle = accent;
	context.font = '500 23px "Plus Jakarta Sans", sans-serif';
	context.fillText(experience.period.slice(0, 34), 54, 700);
	context.fillStyle = 'rgba(255, 250, 241, 0.76)';
	context.font = '500 20px "Plus Jakarta Sans", sans-serif';
	const roleWords = experience.role.split(/\s+/);
	let roleLine = '';
	let roleY = 750;
	roleWords.forEach((word) => {
		const candidate = roleLine ? `${roleLine} ${word}` : word;
		if (context.measureText(candidate).width > canvas.width - 108 && roleLine) {
			context.fillText(roleLine, 54, roleY);
			roleLine = word;
			roleY += 30;
		} else roleLine = candidate;
	});
	if (roleLine) context.fillText(roleLine, 54, roleY);
	context.fillStyle = accent;
	context.font = '600 18px "Plus Jakarta Sans", sans-serif';
	context.fillText(experience.place.slice(0, 42), 54, 950);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

function fillDialog(content, experience) {
	const fragment = document.createDocumentFragment();
	const title = document.createElement('h2');
	title.id = 'experience-dialog-title';
	title.textContent = experience.title;
	const meta = document.createElement('p');
	meta.className = 'experience-dialog__meta';
	meta.textContent = experience.meta;
	fragment.append(title, meta);
	experience.sections.forEach(([label, items]) => {
		const section = document.createElement('section');
		const heading = document.createElement('h3');
		heading.textContent = label;
		const list = document.createElement('ul');
		items.forEach((text) => {
			const item = document.createElement('li');
			item.textContent = text;
			list.append(item);
		});
		section.append(heading, list);
		fragment.append(section);
	});
	content.replaceChildren(fragment);
}

class ExperienceRingCarousel {
	constructor(root) {
		this.root = root;
		this.track = root.querySelector('[data-experience-track]');
		this.deck = root.querySelector('[data-experience-deck]');
		this.canvas = root.querySelector('[data-experience-ring-canvas]');
		this.info = root.querySelector('[data-experience-ring-info]');
		this.title = root.querySelector('[data-experience-ring-title]');
		this.meta = root.querySelector('[data-experience-ring-meta]');
		this.summary = root.querySelector('[data-experience-ring-summary]');
		this.detailButton = root.querySelector('[data-experience-ring-detail]');
		this.status = root.querySelector('[data-experience-ring-status]');
		this.topline = root.querySelector('[data-experience-chrome]');
		this.counter = root.querySelector('[data-experience-counter]');
		this.progress = root.querySelector('.experience__progress');
		this.progressFill = root.querySelector('[data-experience-progress]');
		this.previous = root.querySelector('[data-experience-previous]');
		this.next = root.querySelector('[data-experience-next]');
		this.controls = root.querySelector('[data-experience-controls]');
		this.dialog = root.querySelector('[data-experience-dialog]');
		this.dialogContent = root.querySelector('[data-experience-dialog-content]');
		this.closeButton = this.dialog?.querySelector('.experience-dialog__close');
		this.cards = [...root.querySelectorAll('[data-experience-card]')];
		this.experiences = this.cards.map(readExperience);
		this.angleStep = (Math.PI * 2) / this.cards.length;
		this.radius = Math.max(3.1, (CARD_WIDTH * 0.72) / Math.sin(Math.PI / this.cards.length));
		this.rotation = 0;
		this.targetRotation = 0;
		this.activeIndex = -1;
		this.animationFrame = 0;
		this.pointer = { down: false, moved: false, lastX: 0, startX: 0, startY: 0 };
		this.wheelRemainder = 0;
		this.reducedMotion = motionPreference.matches;
		this.raycaster = new THREE.Raycaster();
		this.pointerVector = new THREE.Vector2();
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color('#171b1a');
		this.group = new THREE.Group();
		this.scene.add(this.group);
		this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
		this.camera.position.set(0, 0, this.radius + 8.2);
		this.camera.lookAt(0, 0, 0);
		this.cards3d = [];
		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: false, antialias: true, powerPreference: 'high-performance' });
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
		this.renderer.setClearColor('#171b1a');
		this.createCards();
		this.bindEvents();
		this.deck.classList.add('is-ring-active');
		this.cards.forEach((card) => { card.hidden = true; card.inert = true; });
		this.info.hidden = false;
		this.topline.hidden = false;
		this.controls.hidden = false;
		this.status.hidden = true;
		this.resizeObserver.observe(this.deck);
		this.resize();
		this.updateScene();
		this.renderer.render(this.scene, this.camera);
	}

	createCards() {
		this.experiences.forEach((experience) => {
			const material = new THREE.MeshBasicMaterial({
				map: createTexture(experience, experience.index),
				side: THREE.DoubleSide,
				depthWrite: false,
			});
			const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), material);
			mesh.userData.index = experience.index;
			this.group.add(mesh);
			this.cards3d.push(mesh);
		});
	}

	bindEvents() {
		this.onPointerDown = (event) => {
			if (event.button !== 0) return;
			this.pointer.down = true;
			this.pointer.moved = false;
			this.pointer.lastX = event.clientX;
			this.pointer.startX = event.clientX;
			this.pointer.startY = event.clientY;
			this.targetRotation = this.rotation;
			this.canvas.setPointerCapture(event.pointerId);
		};
		this.onPointerMove = (event) => {
			if (!this.pointer.down) return;
			const deltaX = event.clientX - this.pointer.lastX;
			this.pointer.lastX = event.clientX;
			if (Math.abs(event.clientX - this.pointer.startX) + Math.abs(event.clientY - this.pointer.startY) > 5) this.pointer.moved = true;
			if (this.pointer.moved) {
				this.targetRotation += deltaX * 0.008;
				this.render();
			}
		};
		this.onPointerUp = (event) => {
			if (!this.pointer.down) return;
			this.pointer.down = false;
			if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
			if (this.pointer.moved) this.snapToNearest();
			else this.pickCard(event);
		};
		this.onWheel = (event) => {
			event.preventDefault();
			this.wheelRemainder += event.deltaY;
			if (Math.abs(this.wheelRemainder) < 34) return;
			const direction = Math.sign(this.wheelRemainder);
			this.wheelRemainder = 0;
			this.navigate(direction);
		};
		this.onKeyDown = (event) => {
			if (event.target.closest('button')) return;
			if (event.key === 'ArrowLeft') this.navigate(-1);
			else if (event.key === 'ArrowRight') this.navigate(1);
			else if (event.key === 'Home') this.goTo(0);
			else if (event.key === 'End') this.goTo(this.cards.length - 1);
			else return;
			event.preventDefault();
		};
		this.onPrevious = () => this.navigate(-1);
		this.onNext = () => this.navigate(1);
		this.onDetail = () => this.showDetails(this.activeIndex);

		this.canvas.addEventListener('pointerdown', this.onPointerDown);
		this.canvas.addEventListener('pointermove', this.onPointerMove);
		this.canvas.addEventListener('pointerup', this.onPointerUp);
		this.canvas.addEventListener('pointercancel', this.onPointerUp);
		this.deck.addEventListener('wheel', this.onWheel, { passive: false });
		this.deck.addEventListener('keydown', this.onKeyDown);
		this.previous.addEventListener('click', this.onPrevious);
		this.next.addEventListener('click', this.onNext);
		this.detailButton.addEventListener('click', this.onDetail);
	}

	nearestIndex(rotation = this.targetRotation) {
		return mod(Math.round(-rotation / this.angleStep), this.cards.length);
	}

	rotationFor(index, reference = this.targetRotation) {
		const base = -index * this.angleStep;
		return base + Math.round((reference - base) / (Math.PI * 2)) * Math.PI * 2;
	}

	goTo(index) {
		const destination = clampIndex(index, this.cards.length);
		this.targetRotation = this.rotationFor(destination);
		this.render();
	}

	navigate(direction) {
		this.goTo(mod(this.nearestIndex() + direction, this.cards.length));
	}

	snapToNearest() {
		this.goTo(this.nearestIndex());
	}

	pickCard(event) {
		const bounds = this.canvas.getBoundingClientRect();
		this.pointerVector.set(
			((event.clientX - bounds.left) / bounds.width) * 2 - 1,
			-((event.clientY - bounds.top) / bounds.height) * 2 + 1,
		);
		this.raycaster.setFromCamera(this.pointerVector, this.camera);
		const selected = this.raycaster.intersectObjects(this.cards3d, false)[0]?.object.userData.index;
		if (selected === undefined) return;
		if (selected !== this.activeIndex) this.goTo(selected);
		else this.showDetails(selected);
	}

	showDetails(index) {
		const experience = details[this.experiences[index]?.key];
		if (!experience || !this.dialog || !this.dialogContent) return;
		fillDialog(this.dialogContent, experience);
		this.dialog.showModal();
		this.closeButton?.focus();
	}

	resize() {
		const width = Math.max(this.deck.clientWidth, 1);
		const height = Math.max(this.deck.clientHeight, 1);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, false);
		this.render();
	}

	updateScene() {
		this.cards3d.forEach((mesh, index) => {
			const angle = index * this.angleStep + this.rotation;
			const depth = Math.cos(angle);
			const prominence = (depth + 1) / 2;
			mesh.position.set(this.radius * Math.sin(angle), 0, this.radius * depth);
			mesh.rotation.y = angle;
			const scale = 0.76 + prominence * 0.24;
			mesh.scale.set(scale, scale, 1);
			mesh.material.opacity = 0.42 + prominence * 0.58;
			mesh.renderOrder = Math.round(prominence * 10);
		});
		const selected = this.nearestIndex(this.rotation);
		if (selected === this.activeIndex) return;
		this.activeIndex = selected;
		const experience = this.experiences[selected];
		this.title.textContent = experience.title;
		this.meta.textContent = `${experience.role} · ${experience.period}`;
		this.summary.textContent = experience.summary;
		this.counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(this.cards.length).padStart(2, '0')}`;
		this.progress.setAttribute('aria-valuenow', String(selected + 1));
		this.progress.setAttribute('aria-valuetext', `Expérience ${selected + 1} sur ${this.cards.length}`);
		this.progressFill.style.transform = `scaleX(${selected / Math.max(this.cards.length - 1, 1)})`;
	}

	frame() {
		this.animationFrame = 0;
		const difference = this.targetRotation - this.rotation;
		this.rotation += difference * (this.reducedMotion ? 1 : 0.14);
		if (Math.abs(difference) < 0.0005) this.rotation = this.targetRotation;
		this.updateScene();
		this.renderer.render(this.scene, this.camera);
		if (Math.abs(this.targetRotation - this.rotation) >= 0.0005) this.animationFrame = requestAnimationFrame(() => this.frame());
	}

	render() {
		if (!this.animationFrame && !this.destroyed) this.animationFrame = requestAnimationFrame(() => this.frame());
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		cancelAnimationFrame(this.animationFrame);
		this.resizeObserver.disconnect();
		this.canvas.removeEventListener('pointerdown', this.onPointerDown);
		this.canvas.removeEventListener('pointermove', this.onPointerMove);
		this.canvas.removeEventListener('pointerup', this.onPointerUp);
		this.canvas.removeEventListener('pointercancel', this.onPointerUp);
		this.deck.removeEventListener('wheel', this.onWheel);
		this.deck.removeEventListener('keydown', this.onKeyDown);
		this.previous.removeEventListener('click', this.onPrevious);
		this.next.removeEventListener('click', this.onNext);
		this.detailButton.removeEventListener('click', this.onDetail);
		this.cards.forEach((card) => { card.hidden = false; card.inert = false; });
		this.deck.classList.remove('is-ring-active');
		this.info.hidden = true;
		this.topline.hidden = true;
		this.controls.hidden = true;
		this.cards3d.forEach((mesh) => {
			mesh.geometry.dispose();
			mesh.material.map?.dispose();
			mesh.material.dispose();
		});
		this.renderer.dispose();
	}
}

const root = document.querySelector('.experience--3d');
let carousel;

root?.addEventListener('click', (event) => {
	const button = event.target.closest('[data-experience-detail]');
	const key = button?.closest('[data-experience-card]')?.dataset.experienceKey;
	const experience = details[key];
	const dialog = root.querySelector('[data-experience-dialog]');
	const content = root.querySelector('[data-experience-dialog-content]');
	if (!experience || !dialog || !content) return;
	fillDialog(content, experience);
	dialog.showModal();
	dialog.querySelector('.experience-dialog__close')?.focus();
});

function sync() {
	carousel?.destroy();
	carousel = undefined;
	if (!root || motionPreference.matches) return;
	try {
		carousel = new ExperienceRingCarousel(root);
	} catch {}
}

sync();
motionPreference.addEventListener('change', sync);
window.addEventListener('pagehide', () => carousel?.destroy());
window.addEventListener('pageshow', (event) => { if (event.persisted) sync(); });
