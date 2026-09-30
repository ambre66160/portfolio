# Portfolio d'Ambre

Le frontend est composé de pages HTML statiques, de CSS et de modules JavaScript. Le backend PHP expose les projets et le formulaire de contact en JSON. Node.js 22.13.1 et PHP 8.1 ou supérieur sont requis.

## Développement local

Installer les dépendances une première fois :

```sh
PATH="$HOME/.local/lib/nodejs/node-v22.13.1-linux-x64/bin:$PATH" npm ci
```

Dans un premier terminal, démarrer l’API PHP :

```sh
php -S 127.0.0.1:8001 -t .
```

Dans un second terminal, démarrer Vite :

```sh
PATH="$HOME/.local/lib/nodejs/node-v22.13.1-linux-x64/bin:$PATH" npm run dev
```

Ouvrir `http://127.0.0.1:5173`. Vite transmet les requêtes `/api/*` au serveur PHP sur le port 8001. Les pages sont `index.html`, `projets.html`, `projet-detail.html?slug=ekoroji`, `qui-suis-je.html`, `competences.html` et `contact.html`.

## API REST

Les données de projets sont conservées dans `config/projets.json` et ne sont plus intégrées au HTML côté serveur.

| Méthode | URL | Réponse |
| --- | --- | --- |
| `GET` | `/api/projects.php` | `200 { "data": [Project, ...] }` |
| `GET` | `/api/projects.php?slug=ekoroji` | `200 { "data": Project }`, `400` pour un slug invalide, `404` si absent |
| `GET` | `/api/contact.php` | `200 { "data": { "csrfToken": "…" } }` et cookie CSRF `HttpOnly`, `SameSite=Strict` |
| `POST` | `/api/contact.php` | JSON du formulaire, en-têtes `Content-Type: application/json` et `X-CSRF-Token` |

Corps JSON du formulaire :

```json
{
	"name": "Camille Martin",
	"email": "camille@example.com",
	"subject": "Projet web",
	"message": "Bonjour, parlons de ce projet."
}
```

Réponse de succès : `200 { "data": { "message": "Merci, votre message a bien été envoyé." } }`. Les erreurs suivent la forme `{ "error": { "code": "…", "message": "…", "fields": {} } }` avec les statuts `400`, `403`, `415`, `422` ou `503` selon le cas.

Le jeton CSRF est conservé en mémoire JavaScript et vérifié contre un cookie `HttpOnly`; aucune session PHP ni donnée d’authentification n’est stockée dans le navigateur. Le formulaire utilise `mail()`, donc le serveur doit être configuré pour envoyer des e-mails.

En production, servir le contenu de `dist/` comme fichiers statiques et router `/api/*` vers le backend PHP sur la même origine. Cette configuration de même origine permet d’éviter d’exposer l’API à CORS permissif.

## GitHub Pages

GitHub Pages sert les fichiers statiques sous `/portfolio/` et n’exécute pas PHP. Le frontend charge donc les projets depuis `config/projets.json` lorsque l’API n’est pas disponible. Le formulaire ouvre le client e-mail comme solution de repli ; pour conserver l’envoi JSON, héberger `api/` sur un serveur PHP et configurer une API accessible depuis le site.

## Build

```sh
PATH="$HOME/.local/lib/nodejs/node-v22.13.1-linux-x64/bin:$PATH" npm run build
```

Vite génère les six pages frontend dans `dist/`. Le backend PHP et `config/projets.json` sont déployés séparément.
