export class ApiError extends Error {
	constructor(message, status, fields = {}) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.fields = fields;
	}
}

let projectsPromise;

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

export async function getProjects() {
	if (!projectsPromise) {
		projectsPromise = (async () => {
			try {
				return await requestJson('api/projects.php');
			} catch (apiError) {
				try {
					const dataUrl = new URL('config/projets.json', document.baseURI);
					dataUrl.searchParams.set('v', '5');
					const response = await fetch(dataUrl);
					if (!response.ok) throw new Error('Les données statiques sont indisponibles.');
					const projects = await response.json();
					if (!Array.isArray(projects)) throw new Error('Le format des projets est invalide.');
					return projects;
				} catch {
					throw apiError;
				}
			}
		})();
	}

	try {
		return await projectsPromise;
	} catch (error) {
		projectsPromise = undefined;
		throw error;
	}
}

export async function getProject(slug) {
	const projects = await getProjects();
	const project = projects.find((item) => item.slug === slug);
	if (!project) throw new ApiError('Ce projet est introuvable.', 404);
	return project;
}
