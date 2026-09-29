const menuToggle = document.querySelector('.site-nav__toggle');
const siteMenu = document.querySelector('#site-menu');

if (menuToggle && siteMenu) {
	const closeMenu = () => {
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
		siteMenu.classList.remove('is-open');
	};

	menuToggle.addEventListener('click', () => {
		const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
		menuToggle.setAttribute('aria-expanded', String(!isExpanded));
		menuToggle.setAttribute('aria-label', isExpanded ? 'Ouvrir le menu' : 'Fermer le menu');
		siteMenu.classList.toggle('is-open', !isExpanded);
	});

	siteMenu.addEventListener('click', (event) => {
		if (event.target instanceof HTMLAnchorElement) closeMenu();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeMenu();
	});
}
