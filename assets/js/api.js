export class ApiError extends Error {
	constructor(message, status, fields = {}) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.fields = fields;
	}
}

export async function requestJson(path, options = {}) {
	const { headers = {}, ...fetchOptions } = options;
	let response;
	try {
		response = await fetch(path, {
			...fetchOptions,
			credentials: 'same-origin',
			headers: { Accept: 'application/json', ...headers },
		});
	} catch {
		throw new ApiError('Le serveur est injoignable. Réessayez dans un instant.', 0);
	}

	let payload;
	try {
		payload = await response.json();
	} catch {
		throw new ApiError('La réponse du serveur est illisible.', response.status);
	}

	if (!response.ok) {
		throw new ApiError(
			payload?.error?.message || 'La requête a échoué.',
			response.status,
			payload?.error?.fields || {},
		);
	}

	return payload.data;
}
