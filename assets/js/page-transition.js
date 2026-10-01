import { animate, stagger } from 'motion';

const entrySelector = '.hero__role, .hero__title, .hero__version, .hero__actions > *, h1, .projects-intro__eyebrow, .projects-intro__bottom, .competences-intro__text, .contact-heading__eyebrow, .contact-heading > p:last-child, .about-eyebrow';
const entryOptions = {
	delay: stagger(0.06),
	duration: 0.8,
	ease: [0.25, 1, 0.5, 1],
};

function playInitialLoader() {
	try {
		if (sessionStorage.getItem('portfolio-motion-seen')) return;
		sessionStorage.setItem('portfolio-motion-seen', '1');
	} catch {
		return;
	}

	const loader = document.createElement('div');
	loader.className = 'page-loader';
	loader.setAttribute('aria-hidden', 'true');
	const mark = document.createElement('span');
	mark.className = 'page-loader__mark';
	mark.textContent = 'A';
	loader.append(mark);
	document.body.append(loader);

	const curtain = animate(loader, { scaleY: [1, 0] }, { duration: 0.72, ease: [0.16, 1, 0.3, 1] });
	animate(mark, { opacity: [0, 1, 0], scale: [0.92, 1, 1.06] }, { duration: 0.62, times: [0, 0.2, 1], ease: [0.25, 1, 0.5, 1] });
	curtain.then(() => loader.remove());
}

export function PageTransition(root = document.body) {
	const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
	if (!root || motionPreference.matches) return () => {};

	const animatedElements = new WeakSet();
	const targets = [...root.querySelectorAll(entrySelector)].filter((element) => {
		const bounds = element.getBoundingClientRect();
		return bounds.bottom > 0 && bounds.top < window.innerHeight;
	});
	targets.forEach((element) => animatedElements.add(element));

	playInitialLoader();
	let isFinished = false;
	let animation;
	let disposed = false;

	function finish() {
		if (isFinished) return;
		isFinished = true;
		document.documentElement.classList.remove('is-page-transitioning');
	}

	function handleMotionPreference() {
		if (motionPreference.matches) dispose();
	}

	function dispose() {
		if (disposed) return;
		disposed = true;
		animation?.complete();
		mutationObserver.disconnect();
		finish();
		window.removeEventListener('pagehide', dispose);
		motionPreference.removeEventListener('change', handleMotionPreference);
	}

	const mutationObserver = new MutationObserver((records) => {
		const added = records.flatMap(({ addedNodes }) => [...addedNodes]).flatMap((node) => {
			if (!(node instanceof Element)) return [];
			return [
				...(node.matches(entrySelector) ? [node] : []),
				...node.querySelectorAll(entrySelector),
			];
		});
		const visible = [...new Set(added)].filter((element) => {
			if (animatedElements.has(element)) return false;
			const bounds = element.getBoundingClientRect();
			if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return false;
			animatedElements.add(element);
			return true;
		});
		if (visible.length) animate(visible, { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, ease: [0.25, 1, 0.5, 1] });
	});

	mutationObserver.observe(root, { childList: true, subtree: true });
	window.addEventListener('pagehide', dispose);
	motionPreference.addEventListener('change', handleMotionPreference);
	if (targets.length) {
		document.documentElement.classList.add('is-page-transitioning');
		animation = animate(targets, { opacity: [0, 1], y: [40, 0] }, entryOptions);
		const verticalHeroLabel = root.querySelector('.hero__vertical');
		if (verticalHeroLabel) animate(verticalHeroLabel, { opacity: [0, 1] }, { duration: 0.64, delay: 0.12, ease: [0.25, 1, 0.5, 1] });
		animation.then(finish);
	}
	return dispose;
}

PageTransition();