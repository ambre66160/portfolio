import { requestJson } from './api.js?v=3';

const form = document.querySelector('#contact-form');
const status = document.querySelector('#contact-status');

if (form instanceof HTMLFormElement && status) {
	const submitButton = form.querySelector('[type="submit"]');
	let csrfToken = '';

	const showStatus = (message, state) => {
		status.textContent = message;
		status.hidden = !message;
		status.classList.toggle('is-error', state === 'error');
		status.classList.toggle('is-success', state === 'success');
		status.setAttribute('role', state === 'error' ? 'alert' : 'status');
	};

	const clearFieldErrors = () => {
		form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
	};

	form.addEventListener('input', (event) => {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			event.target.removeAttribute('aria-invalid');
		}
	});

	try {
		const result = await requestJson('api/contact.php?v=3');
		csrfToken = result.csrfToken;
	} catch (error) {
		showStatus('L’envoi direct est indisponible sur cet hébergement. Votre messagerie prendra le relais.', '');
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		if (!csrfToken) {
			const formData = new FormData(form);
			const name = String(formData.get('name') || '').trim();
			const subject = String(formData.get('subject') || '').trim() || `Message de ${name}`;
			const body = `Nom : ${name}\nE-mail : ${String(formData.get('email') || '').trim()}\n\n${String(formData.get('message') || '').trim()}`;
			window.location.href = `mailto:ambre.florette@etu.cyu.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
			return;
		}

		clearFieldErrors();
		form.classList.add('is-loading');
		form.setAttribute('aria-busy', 'true');
		if (submitButton) submitButton.disabled = true;
		showStatus('Envoi en cours…', '');

		const formData = new FormData(form);
		const payload = Object.fromEntries(['name', 'email', 'subject', 'message'].map((name) => [name, String(formData.get(name) || '').trim()]));

		try {
			const result = await requestJson('api/contact.php?v=3', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify(payload),
			});
			form.reset();
			showStatus(result.message, 'success');
			const refreshed = await requestJson('api/contact.php?v=3');
			csrfToken = refreshed.csrfToken;
		} catch (error) {
			Object.keys(error.fields || {}).forEach((name) => {
				const field = form.elements.namedItem(name);
				if (field instanceof HTMLElement) field.setAttribute('aria-invalid', 'true');
			});
			showStatus(error.message, 'error');
		} finally {
			form.classList.remove('is-loading');
			form.setAttribute('aria-busy', 'false');
			if (submitButton && csrfToken) submitButton.disabled = false;
		}
	});
}
