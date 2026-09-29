const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

if (contactForm instanceof HTMLFormElement && contactStatus) {
	contactForm.addEventListener('submit', (event) => {
		event.preventDefault();

		if (!contactForm.reportValidity()) return;

		const formData = new FormData(contactForm);
		const name = String(formData.get('name') || '').trim();
		const email = String(formData.get('email') || '').trim();
		const subject = String(formData.get('subject') || '').trim() || `Message de ${name}`;
		const message = String(formData.get('message') || '').trim();
		const body = `Nom : ${name}\nE-mail : ${email}\n\n${message}`;
		const mailto = `mailto:ambre.florette@etu.cyu.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

		contactStatus.textContent = 'Votre application de messagerie va s’ouvrir avec le message prérempli.';
		window.location.href = mailto;
	});
}
