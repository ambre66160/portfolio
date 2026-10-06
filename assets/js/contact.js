const form = document.querySelector('#contact-form');
const status = document.querySelector('#contact-status');

if (form instanceof HTMLFormElement && status) {
	const submitButton = form.querySelector('[type="submit"]');
	const submitLabel = form.querySelector('[data-submit-label]');
	const fields = {
		name: form.elements.namedItem('name'),
		email: form.elements.namedItem('email'),
		subject: form.elements.namedItem('subject'),
		message: form.elements.namedItem('message'),
		honeypot: form.elements.namedItem('website'),
	};
	const emailPattern = /^(?=.{1,254}$)(?=.{1,64}@)[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i;
	const cooldownKey = 'portfolio-contact-last-sent';
	const cooldownMs = 2 * 60 * 1000;
	const emailJs = {
		serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
		templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
		publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
	};
	const contactAddress = document.querySelector('.contact-details a[href^="mailto:"]')?.getAttribute('href');
	let isSending = false;

	const showStatus = (message, state = '') => {
		status.textContent = message;
		status.hidden = !message;
		status.classList.toggle('is-error', state === 'error');
		status.classList.toggle('is-success', state === 'success');
		status.setAttribute('role', state === 'error' ? 'alert' : 'status');
	};

	const cleanText = (value, multiline = false) => String(value)
		.normalize('NFC')
		.replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '')
		.trim();

	const getCooldownRemaining = () => {
		try {
			const lastSent = Number(window.localStorage.getItem(cooldownKey));
			if (!Number.isFinite(lastSent) || lastSent <= 0) return 0;
			const remaining = cooldownMs - (Date.now() - lastSent);
			if (remaining <= 0) window.localStorage.removeItem(cooldownKey);
			return Math.max(remaining, 0);
		} catch {
			return 0;
		}
	};

	const storeCooldown = () => {
		try {
			window.localStorage.setItem(cooldownKey, String(Date.now()));
		} catch {}
	};

	form.addEventListener('input', (event) => {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			event.target.setCustomValidity('');
			event.target.removeAttribute('aria-invalid');
		}
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (isSending || !form.reportValidity()) return;

		const values = {
			name: cleanText(fields.name.value),
			email: cleanText(fields.email.value),
			subject: cleanText(fields.subject.value),
			message: cleanText(fields.message.value, true),
		};
		fields.email.setCustomValidity(emailPattern.test(values.email) ? '' : 'Saisissez une adresse e-mail valide.');
		fields.name.setCustomValidity(values.name.length >= 2 && values.name.length <= 150 ? '' : 'Le nom doit contenir entre 2 et 150 caractères.');
		fields.subject.setCustomValidity(values.subject.length <= 180 ? '' : 'Le sujet ne peut pas dépasser 180 caractères.');
		fields.message.setCustomValidity(values.message.length >= 10 && values.message.length <= 8000 ? '' : 'Le message doit contenir entre 10 et 8 000 caractères.');
		if (!form.reportValidity()) return;

		if (fields.honeypot.value.trim()) {
			return;
		}

		const cooldownRemaining = getCooldownRemaining();
		if (cooldownRemaining > 0) {
			showStatus('Veuillez patienter deux minutes avant de renvoyer un message.', 'error');
			return;
		}

		if (!emailJs.serviceId || !emailJs.templateId || !emailJs.publicKey) {
			if (!contactAddress) {
				showStatus('L’adresse de contact est indisponible.', 'error');
				return;
			}
			const mailtoParams = new URLSearchParams({
				subject: values.subject || `Message de ${values.name}`,
				body: `Nom : ${values.name}\nE-mail : ${values.email}\n\n${values.message}`,
			});
			showStatus('Votre messagerie va s’ouvrir avec votre message prérempli.');
			window.location.href = `${contactAddress}?${mailtoParams.toString()}`;
			return;
		}

		isSending = true;
		form.classList.add('is-loading');
		form.setAttribute('aria-busy', 'true');
		if (submitButton) {
			submitButton.disabled = true;
			submitButton.classList.add('is-loading');
		}
		if (submitLabel) submitLabel.textContent = 'Envoi en cours…';
		showStatus('Envoi en cours…', '');

		try {
			const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
				method: 'POST',
				credentials: 'omit',
				headers: { 'Content-Type': 'application/json' },
				signal: AbortSignal.timeout(15000),
				body: JSON.stringify({
					service_id: emailJs.serviceId,
					template_id: emailJs.templateId,
					user_id: emailJs.publicKey,
					template_params: {
						from_name: values.name,
						reply_to: values.email,
						subject: values.subject || `Message de ${values.name}`,
						message: values.message,
					},
				}),
			});
			if (!response.ok) throw new Error('email_service_rejected');
			storeCooldown();
			form.reset();
			showStatus('Merci, votre message a bien été envoyé.', 'success');
		} catch {
			showStatus('L’envoi a échoué. Vérifiez votre connexion puis réessayez.', 'error');
		} finally {
			isSending = false;
			form.classList.remove('is-loading');
			form.setAttribute('aria-busy', 'false');
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.classList.remove('is-loading');
			}
			if (submitLabel) submitLabel.textContent = 'Envoyer le message';
		}
	});
}
