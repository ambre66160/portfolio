import { animate, springValue, stagger } from 'motion';

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const revealSelector = '.section__eyebrow, .section__heading-row, .info-card, .project-card, .project-hero__visual, .project-meta > div, .metric-card, .project-context__visual, .approach-card, .learning-card, .skill-card, .skill-card__badges, .passion-card, .contact-detail, .contact-form, .social-card, .about-quote';
const magneticSelector = '.button, .social-card';
const magneticSpring = { stiffness: 360, damping: 32, mass: 0.35 };
const pointerSpring = { stiffness: 520, damping: 40, mass: 0.35 };

function startMotionInteractions() {
	const animatedElements = new WeakSet();
	const observedElements = new WeakSet();
	const magneticElements = new WeakMap();
	const visualElements = new WeakMap();
	const springs = new Set();
	const animations = new Set();
	const cleanupTimers = new Set();
	let activeMagnetic;
	let activeVisual;
	let cursor;
	let cursorX;
	let cursorY;

	function animateTracked(target, keyframes, options) {
		const animation = animate(target, keyframes, options);
		animations.add(animation);
		animation.then(() => animations.delete(animation));
		return animation;
	}

	function createSpring(node, property, initial, options, suffix = 'px') {
		const value = springValue(initial, options);
		value.on('change', (latest) => node.style.setProperty(property, `${latest}${suffix}`));
		springs.add(value);
		return value;
	}

	function reveal(target) {
		if (animatedElements.has(target)) return;
		animatedElements.add(target);

		if (target.matches('.skill-card__badges')) {
			const badges = [...target.children];
			if (badges.length) {
				animateTracked(
					badges,
					{ opacity: [0, 1], y: [8, 0], scale: [0.92, 1] },
					{ type: 'spring', visualDuration: 0.52, bounce: 0.12, delay: stagger(0.035) },
				);
			}
			return;
		}

		const isProject = target.matches('.project-card');
		animateTracked(
			target,
			{
				opacity: [0, 1],
				y: [isProject ? 20 : 14, 0],
				scale: [isProject ? 0.95 : 0.985, 1],
			},
			{ duration: isProject ? 0.56 : 0.46, ease: [0.22, 1, 0.36, 1] },
		);
	}

	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			revealObserver.unobserve(entry.target);
			reveal(entry.target);
		});
	}, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

	function observeReveal(target) {
		if (observedElements.has(target) || animatedElements.has(target)) return;
		observedElements.add(target);
		revealObserver.observe(target);
	}

	function prepareMagnetic(target) {
		if (magneticElements.has(target)) return;
		target.classList.add('has-magnetic-motion');
		magneticElements.set(target, {
			rect: null,
			x: createSpring(target, '--magnetic-x', 0, magneticSpring),
			y: createSpring(target, '--magnetic-y', 0, magneticSpring),
		});
	}

	function prepareVisual(target) {
		if (visualElements.has(target)) return;
		const image = target.querySelector('img');
		if (!image) return;
		target.classList.add('has-parallax-motion');
		visualElements.set(target, {
			rect: null,
			x: createSpring(image, '--project-image-x', 0, { stiffness: 240, damping: 32 }),
			y: createSpring(image, '--project-image-y', 0, { stiffness: 240, damping: 32 }),
			scale: createSpring(image, '--project-image-scale', 1, { stiffness: 260, damping: 30 }, ''),
		});
	}

	function scan(node) {
		if (!(node instanceof Element)) return;
		if (node.matches(revealSelector)) observeReveal(node);
		if (node.matches(magneticSelector)) prepareMagnetic(node);
		node.querySelectorAll(revealSelector).forEach(observeReveal);
		node.querySelectorAll(magneticSelector).forEach(prepareMagnetic);
		node.querySelectorAll('.project-card__visual--image, .project-art--data').forEach(prepareVisual);
		if (node.matches('.project-card__visual--image, .project-art--data')) prepareVisual(node);
	}

	document.querySelectorAll(revealSelector).forEach(observeReveal);
	document.querySelectorAll(magneticSelector).forEach(prepareMagnetic);
	document.querySelectorAll('.project-card__visual--image, .project-art--data').forEach(prepareVisual);

	const mutationObserver = new MutationObserver((records) => {
		records.forEach(({ addedNodes }) => addedNodes.forEach(scan));
	});
	mutationObserver.observe(document.body, { childList: true, subtree: true });

	if (finePointer.matches) {
		cursor = document.createElement('div');
		cursor.className = 'custom-cursor';
		cursor.setAttribute('aria-hidden', 'true');
		const label = document.createElement('span');
		label.className = 'custom-cursor__label';
		cursor.append(label);
		document.body.append(cursor);
		document.documentElement.classList.add('has-custom-cursor');
		cursorX = createSpring(cursor, '--cursor-x', -100, pointerSpring);
		cursorY = createSpring(cursor, '--cursor-y', -100, pointerSpring);
	}

	function setMagneticTarget(target) {
		if (activeMagnetic === target) return;
		if (activeMagnetic) {
			const previous = magneticElements.get(activeMagnetic);
			previous?.x.set(0);
			previous?.y.set(0);
		}
		activeMagnetic = target;
		if (!target) return;
		const state = magneticElements.get(target);
		if (state) state.rect = target.getBoundingClientRect();
	}

	function setVisualTarget(target) {
		if (activeVisual === target) return;
		if (activeVisual) resetVisual(activeVisual);
		activeVisual = target;
		if (!target) return;
		const state = visualElements.get(target);
		if (!state) return;
		state.rect = target.getBoundingClientRect();
		target.classList.add('is-parallax-active');
		state.scale.set(1.045);
	}

	function resetVisual(target) {
		const state = visualElements.get(target);
		if (!state) return;
		state.x.set(0);
		state.y.set(0);
		state.scale.set(1);
		const timer = window.setTimeout(() => {
			target.classList.remove('is-parallax-active');
			cleanupTimers.delete(timer);
		}, 360);
		cleanupTimers.add(timer);
	}

	function updateCursorState(target) {
		if (!cursor) return;
		const visual = target?.closest('.project-card__visual--image, .project-art--data');
		const interactive = target?.closest('a, button, input, textarea, select, [role="button"]');
		cursor.classList.toggle('is-interactive', Boolean(interactive));
		cursor.classList.toggle('is-view', Boolean(visual));
		cursor.querySelector('.custom-cursor__label').textContent = visual ? 'VOIR' : '';
	}

	function handlePointerOver(event) {
		if (event.pointerType === 'touch' || !(event.target instanceof Element)) return;
		const magnetic = event.target.closest(magneticSelector);
		const visual = event.target.closest('.project-card__visual--image, .project-art--data');
		setMagneticTarget(magnetic);
		setVisualTarget(visual);
		updateCursorState(event.target);
	}

	function handlePointerMove(event) {
		if (event.pointerType === 'touch') return;
		if (cursor) {
			cursor.classList.add('is-visible');
			cursorX.set(event.clientX);
			cursorY.set(event.clientY);
		}

		if (activeMagnetic) {
			const state = magneticElements.get(activeMagnetic);
			if (state?.rect?.width && state.rect.height) {
				const strength = activeMagnetic.matches('.social-card') ? 5 : 7;
				const x = (event.clientX - state.rect.left) / state.rect.width - 0.5;
				const y = (event.clientY - state.rect.top) / state.rect.height - 0.5;
				state.x.set(x * strength);
				state.y.set(y * strength);
			}
		}

		if (activeVisual) {
			const state = visualElements.get(activeVisual);
			if (state?.rect?.width && state.rect.height) {
				const x = (event.clientX - state.rect.left) / state.rect.width - 0.5;
				const y = (event.clientY - state.rect.top) / state.rect.height - 0.5;
				state.x.set(-x * 7);
				state.y.set(-y * 5);
			}
		}
	}

	function handlePointerOut(event) {
		if (event.pointerType === 'touch') return;
		if (activeMagnetic && (!event.relatedTarget || !activeMagnetic.contains(event.relatedTarget))) setMagneticTarget(null);
		if (activeVisual && (!event.relatedTarget || !activeVisual.contains(event.relatedTarget))) setVisualTarget(null);
		if (!event.relatedTarget && cursor) cursor.classList.remove('is-visible', 'is-interactive', 'is-view');
		else if (event.relatedTarget instanceof Element) updateCursorState(event.relatedTarget);
	}

	function handleWindowBlur() {
		setMagneticTarget(null);
		setVisualTarget(null);
		cursor?.classList.remove('is-visible', 'is-interactive', 'is-view');
	}

	if (finePointer.matches) {
		document.addEventListener('pointerover', handlePointerOver, { passive: true });
		document.addEventListener('pointermove', handlePointerMove, { passive: true });
		document.addEventListener('pointerout', handlePointerOut, { passive: true });
		window.addEventListener('blur', handleWindowBlur);
	}

	return () => {
		revealObserver.disconnect();
		mutationObserver.disconnect();
		document.removeEventListener('pointerover', handlePointerOver);
		document.removeEventListener('pointermove', handlePointerMove);
		document.removeEventListener('pointerout', handlePointerOut);
		window.removeEventListener('blur', handleWindowBlur);
		animations.forEach((animation) => animation.complete());
		springs.forEach((spring) => spring.destroy());
		cleanupTimers.forEach((timer) => window.clearTimeout(timer));
		cursor?.remove();
		document.documentElement.classList.remove('has-custom-cursor');
	};
}

let cleanup;

function start() {
	if (!cleanup && !motionPreference.matches) cleanup = startMotionInteractions();
}

function stop() {
	cleanup?.();
	cleanup = undefined;
}

start();
motionPreference.addEventListener('change', () => (motionPreference.matches ? stop() : start()));
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', start);