import { animate } from 'motion';

const heroTitle = document.querySelector('.hero__title-wrap');

if (heroTitle && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTitle.style.animation = 'none';
    animate(
        heroTitle,
        { opacity: [0, 1], y: [22, 0] },
        { duration: 0.85, ease: 'easeOut' },
    );
}
