import { springValue } from 'motion';
import { scrollToPage } from './smooth-scroll.js?v=3';

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

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
		sections: [['Missions', ['Refonte intégrale du site en PHP, HTML, CSS et JavaScript.', 'Création de la charte graphique, des logos et de contenus pour les réseaux sociaux.', 'Cadrage du besoin, vulgarisation et accompagnement d’un client non-technique.', 'Pilotage autonome du projet, du besoin au déploiement.']]],
	},
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

function mount(root) {
	const track = root.querySelector('[data-experience-track]');
	const stage = root.querySelector('[data-experience-carousel]');
	const deck = root.querySelector('[data-experience-deck]');
	const cards = [...root.querySelectorAll('[data-experience-card]')];
	const chrome = root.querySelector('[data-experience-chrome]');
	const controls = root.querySelector('[data-experience-controls]');
	const counter = root.querySelector('[data-experience-counter]');
	const progress = root.querySelector('.experience__progress');
	const progressFill = root.querySelector('[data-experience-progress]');
	const previous = root.querySelector('[data-experience-previous]');
	const next = root.querySelector('[data-experience-next]');
	const dialog = root.querySelector('[data-experience-dialog]');
	const dialogContent = root.querySelector('[data-experience-dialog-content]');
	const close = dialog?.querySelector('.experience-dialog__close');
	if (!track || !stage || !deck || cards.length < 2) return () => {};

	let raf = 0;
	let span = 1;
	let spread = 220;
	let trackStart = 0;
	let activeIndex = -1;
	let destroyed = false;
	const tiltValues = new Map();

	function measure() {
		span = Math.max(track.offsetHeight - stage.offsetHeight, 1);
		spread = Math.min(Math.max(deck.clientWidth * 0.32, 120), 360);
	}

	function update() {
		raf = 0;
		const progressValue = clamp(-track.getBoundingClientRect().top / span, 0, 1);
		const position = progressValue * (cards.length - 1);
		const selected = Math.round(position);
		cards.forEach((card, index) => {
			const offset = index - position;
			const distance = Math.abs(offset);
			card.style.setProperty('--experience-x', `${offset * spread}px`);
			card.style.setProperty('--experience-z', `${-distance * 205}px`);
			card.style.setProperty('--experience-angle', `${offset * -24}deg`);
			card.style.setProperty('--experience-scale', String(1 - Math.min(distance, 1) * 0.14));
			card.style.setProperty('--experience-opacity', String(Math.max(0.18, 1 - distance * 0.58)));
			card.style.setProperty('--experience-blur', `${Math.min(distance, 1) * 1.1}px`);
			card.style.zIndex = String(20 - Math.round(distance * 5));
			card.classList.toggle('is-active', index === selected);
			card.setAttribute('aria-hidden', String(distance > 1.1));
			card.inert = distance > 1.1;
			if (index === selected) card.setAttribute('aria-current', 'step');
			else card.removeAttribute('aria-current');
		});
		if (selected !== activeIndex) {
			activeIndex = selected;
			counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
			progress.setAttribute('aria-valuenow', String(selected + 1));
			progress.setAttribute('aria-valuetext', `Expérience ${selected + 1} sur ${cards.length}`);
			previous.disabled = selected === 0;
			next.disabled = selected === cards.length - 1;
		}
		progressFill.style.transform = `scaleX(${progressValue})`;
	}

	function schedule() {
		if (!raf && !destroyed) raf = requestAnimationFrame(update);
	}

	function remeasure() {
		measure();
		schedule();
		trackStart = track.getBoundingClientRect().top + window.scrollY;
	}

	function goTo(index) {
		const destinationIndex = clamp(index, 0, cards.length - 1);
		const destination = trackStart + span * destinationIndex / (cards.length - 1);
		scrollToPage(destination, { duration: 0.85 });
	}

	function onKeydown(event) {
		if (!(event.target === deck || event.target.closest?.('.experience__control, [data-experience-card]'))) return;
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
		if (event.key === 'ArrowRight') goTo(activeIndex + 1);
		if (event.key === 'Home') goTo(0);
		if (event.key === 'End') goTo(cards.length - 1);
	}

	function onClick(event) {
		if (!(event.target instanceof Element)) return;
		const button = event.target.closest('[data-experience-detail]');
		const data = details[button?.closest('[data-experience-card]')?.dataset.experienceKey];
		if (!data || !dialog || !dialogContent) return;
		fillDialog(dialogContent, data);
		dialog.showModal();
		close.focus();
	}

	function addTilt(card) {
		if (!finePointer.matches) return;
		const tiltX = springValue(0, { stiffness: 260, damping: 28, mass: 0.45 });
		const tiltY = springValue(0, { stiffness: 260, damping: 28, mass: 0.45 });
		tiltX.on('change', (value) => card.style.setProperty('--experience-tilt-x', `${value}deg`));
		tiltY.on('change', (value) => card.style.setProperty('--experience-tilt-y', `${value}deg`));
		const onMove = (event) => {
			if (!card.classList.contains('is-active')) return;
			const rect = card.getBoundingClientRect();
			tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 5);
			tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 7);
		};
		const onLeave = () => { tiltX.set(0); tiltY.set(0); };
		card.addEventListener('pointermove', onMove, { passive: true });
		card.addEventListener('pointerleave', onLeave, { passive: true });
		tiltValues.set(card, { tiltX, tiltY, onMove, onLeave });
	}

	function onPrevious() { goTo(activeIndex - 1); }
	function onNext() { goTo(activeIndex + 1); }

	track.style.setProperty('--experience-card-count', String(cards.length));
	track.classList.add('is-enhanced');
	chrome.hidden = false;
	controls.hidden = false;
	cards.forEach(addTilt);
	measure();
	update();
	const resizeObserver = new ResizeObserver(remeasure);
	resizeObserver.observe(track);
	resizeObserver.observe(deck);
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', remeasure, { passive: true });
	root.addEventListener('keydown', onKeydown);
	root.addEventListener('click', onClick);
	previous.addEventListener('click', onPrevious);
	next.addEventListener('click', onNext);

	return () => {
		if (destroyed) return;
		destroyed = true;
		resizeObserver.disconnect();
		window.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', remeasure);
		root.removeEventListener('keydown', onKeydown);
		root.removeEventListener('click', onClick);
		previous.removeEventListener('click', onPrevious);
		next.removeEventListener('click', onNext);
		tiltValues.forEach(({ tiltX, tiltY, onMove, onLeave }, card) => {
			card.removeEventListener('pointermove', onMove);
			card.removeEventListener('pointerleave', onLeave);
			tiltX.destroy();
			tiltY.destroy();
		});
		if (raf) cancelAnimationFrame(raf);
		cards.forEach((card) => {
			card.inert = false;
			card.removeAttribute('aria-hidden');
			card.removeAttribute('aria-current');
			card.classList.remove('is-active');
			['--experience-x', '--experience-z', '--experience-angle', '--experience-scale', '--experience-opacity', '--experience-blur', '--experience-tilt-x', '--experience-tilt-y'].forEach((property) => card.style.removeProperty(property));
		});
		track.classList.remove('is-enhanced');
		track.style.removeProperty('--experience-card-count');
		chrome.hidden = true;
		controls.hidden = true;
	};
}

const root = document.querySelector('.experience--3d');
let cleanup;
function sync() {
	cleanup?.();
	cleanup = undefined;
	if (!motionPreference.matches && root) cleanup = mount(root);
}

sync();
motionPreference.addEventListener('change', sync);
window.addEventListener('pagehide', () => cleanup?.(), { once: true });
window.addEventListener('pageshow', sync);