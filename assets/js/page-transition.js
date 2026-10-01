import { animate, stagger } from 'motion';

const transitionSelector = 'h1, [data-project-loading], .project-card, .skill-card, .passion-card, .social-card';
const transitionOptions = {
	delay: stagger(0.055),
	duration: 0.72,
	ease: [0.25, 1, 0.5, 1],
};

export function PageTransition(root = document.querySelector('main')) {
	const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
	if (!root || motionPreference.matches) return () => {};

	const activeAnimations = new Set();
	const animatedElements = new WeakSet();
	const observer = new MutationObserver((records) => {
		const addedElements = records.flatMap(({ addedNodes }) => [...addedNodes]).flatMap((node) => {
			if (!(node instanceof Element)) return [];
			return [
				...(node.matches(transitionSelector) ? [node] : []),
				...node.querySelectorAll(transitionSelector),
			];
		});
		animateElements(addedElements);
	});
	let activeCount = 0;
	let initialAnimationFinished = false;
	let isFinished = false;

	function finish() {
		if (isFinished) return;
		isFinished = true;
		observer.disconnect();
		document.documentElement.classList.remove('is-page-transitioning');
		window.removeEventListener('pagehide', completeAnimations);
		motionPreference.removeEventListener('change', handleMotionPreference);
	}

	function completeAnimations() {
		activeAnimations.forEach((animation) => animation.complete());
		finish();
	}

	function handleMotionPreference() {
		if (motionPreference.matches) completeAnimations();
	}

	function animateElements(elements) {
		const targets = [...new Set(elements)].filter((element) => {
			if (animatedElements.has(element)) return false;
			animatedElements.add(element);
			return true;
		});
		if (targets.length === 0 || isFinished) return;

		activeCount += 1;
		const animation = animate(targets, { opacity: [0, 1], y: [18, 0] }, transitionOptions);
		activeAnimations.add(animation);
		animation.then(() => {
			activeAnimations.delete(animation);
			activeCount -= 1;
			if (initialAnimationFinished && activeCount === 0) finish();
		});
	}

	const initialTargets = [...root.querySelectorAll(transitionSelector)];
	if (initialTargets.length === 0) initialTargets.push(root);
	document.documentElement.classList.add('is-page-transitioning');
	observer.observe(root, { childList: true, subtree: true });
	window.addEventListener('pagehide', completeAnimations);
	motionPreference.addEventListener('change', handleMotionPreference);
	animateElements(initialTargets);
	initialAnimationFinished = true;
	if (activeCount === 0) finish();

	return finish;
}

PageTransition();