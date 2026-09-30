async function loadPartial(slot, path) {
	if (!slot) return;
	try {
		const response = await fetch(path, { headers: { Accept: 'text/html' } });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		slot.innerHTML = await response.text();
	} catch {
		slot.setAttribute('hidden', '');
	}
}

function initializeNavigation() {
	const menuToggle = document.querySelector('.site-nav__toggle');
	const siteMenu = document.querySelector('#site-menu');
	const header = document.querySelector('.projects-header');
	if (header && document.body.classList.contains('home-page')) header.classList.add('projects-header--home');
	if (!menuToggle || !siteMenu) return;

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

	const currentPath = window.location.pathname.split('/').pop() || 'index.html';
	document.querySelectorAll('.projects-nav__menu a').forEach((link) => {
		const linkPath = new URL(link.href).pathname.split('/').pop();
		if (linkPath === currentPath) {
			link.classList.add('active');
			link.setAttribute('aria-current', 'page');
		}
	});
}

await Promise.all([
	loadPartial(document.querySelector('[data-site-header]'), 'assets/partials/header.html?v=3'),
	loadPartial(document.querySelector('[data-site-footer]'), 'assets/partials/footer.html?v=3'),
]);
initializeNavigation();
