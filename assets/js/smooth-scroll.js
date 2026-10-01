import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis;

export function scrollToPage(target, options = {}) {
	if (lenis) {
		lenis.scrollTo(target, options);
		return;
	}

	const top = typeof target === 'number'
		? target
		: target.getBoundingClientRect().top + window.scrollY;
	window.scrollTo({ top, behavior: motionPreference.matches || options.immediate ? 'auto' : 'smooth' });
}

function syncSmoothScroll() {
	if (motionPreference.matches) {
		lenis?.destroy();
		lenis = undefined;
		return;
	}

	if (!lenis) {
		lenis = new Lenis({
			autoRaf: true,
			anchors: true,
		});

		const navigation = performance.getEntriesByType('navigation')[0];
		if (navigation?.type === 'navigate' && !window.location.hash) {
			lenis.scrollTo(0, { immediate: true });
		}
	}
}

function destroySmoothScroll() {
	lenis?.destroy();
	lenis = undefined;
}

syncSmoothScroll();
motionPreference.addEventListener('change', syncSmoothScroll);
window.addEventListener('pagehide', destroySmoothScroll);
window.addEventListener('pageshow', syncSmoothScroll);