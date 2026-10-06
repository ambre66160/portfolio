# Audit sécurité et formulaire de contact

Date : 2026-10-06

## Résumé

Le site est un frontend Vite statique publié sous `ambre66160.github.io/portfolio/`. GitHub Pages n’exécute pas le backend PHP. Le formulaire utilise EmailJS quand ses variables de build sont configurées; sinon, il ouvre un courriel prérempli dans l’application de messagerie de l’utilisateur.

## Constats et mesures

| Domaine | Constat | Mesure / statut |
| --- | --- | --- |
| Envoi du formulaire | GitHub Pages ne prend pas en charge le backend PHP; les variables EmailJS peuvent être absentes dans un build local. | `fetch()` asynchrone vers EmailJS si configuré; sinon, ouverture explicite d’un `mailto:` prérempli avec le sujet et le message après validation. |
| Validation et XSS | Validation HTML seule, pas de protection anti-spam dédiée. | Longueurs contrôlées (nom 2–150, sujet 0–180, message 10–8 000, email 254 max et 64 avant `@`), validation email ASCII de type dot-atom (les adresses quoted/local internationalisées restent exclues), normalisation NFC et suppression des caractères de contrôle. Les statuts sont des chaînes constantes affectées à `textContent`; aucune donnée saisie n’est injectée dans le DOM. |
| Abus du formulaire | Pas de honeypot ni de limite locale. | Champ honeypot invisible et cooldown localStorage de 2 minutes après succès; bouton verrouillé pendant la requête et timeout de 15 secondes. Ces contrôles côté client sont contournables et ne remplacent pas les limites EmailJS ni un CAPTCHA. |
| Secrets | `.env.local` est ignoré et n’est pas suivi par Git; `.env.*` est ignoré avec exception pour `.env.example`. Aucun fichier `dist/` n’est suivi. L’analyse de l’historique a couvert des motifs usuels de clés, sans résultat. | Les trois seules variables attendues sont les identifiants publics EmailJS. Aucun secret privé EmailJS ne doit être créé côté client. L’absence de résultat dans une recherche de motifs n’est pas une garantie d’absence de tout secret historique. |
| CSP | GitHub Pages ne permet pas de configurer des en-têtes HTTP arbitraires. | Vite ajoute une CSP via `<meta>` au début de chaque document produit: scripts same-origin sans `unsafe-eval`, `connect-src` limité à same-origin et EmailJS; les sources d’images restent same-origin, data et blob. Les sources de polices/styles correspondent aux Google Fonts et Devicon utilisés. `style-src 'unsafe-inline'` est requis par les animations qui écrivent des propriétés CSS via `element.style`; aucune directive script n’autorise le code inline. Referrer-Policy est aussi exprimée en meta. |
| En-têtes HTTP | Une balise meta ne peut pas fournir HSTS, `X-Content-Type-Options`, `X-Frame-Options` ou `Permissions-Policy`; `frame-ancestors` n’est pas pris en charge dans une CSP meta. | À configurer au niveau d’un proxy/CDN si ces en-têtes sont exigés. HSTS n’est pas ajouté au HTML. Forcer HTTPS dans **Settings → Pages → Enforce HTTPS**. |
| JavaScript/Three.js | Le carrousel d’expériences importe Three.js en chunk dynamique sur l’accueil; aucun `eval()` ou `new Function()` n’est utilisé. Les fiches projets gardent leur rendu HTML préexistant. Les cartes d’expérience sont rendues en CanvasTexture et les textes d’accompagnement via `textContent`. | La CSP autorise `blob:` pour les images, pas pour les scripts. Le carrousel n’effectue aucun chargement de texture distante. Revoir ces restrictions si de nouvelles sources de texture sont ajoutées. |
| Dépendances | L’audit npm initial trouvait 7 avis transitifs, dont des avis high dans `undici`, `@fastify/busboy` et `source-map-js`. | `npm audit fix` sans `--force` a corrigé les avis high/moderate. Deux avis low demeurent sur `esbuild` transitif de `motion-studio@2.1.0`; npm propose `motion-studio@1.5.1`, changement majeur non appliqué sans validation de compatibilité. Dependabot et `npm audit --audit-level=high` suivent les nouvelles alertes. |
| Déploiement | Le workflow utilisait déjà les actions officielles Pages et OIDC, mais les permissions étaient globales. | Permissions réduites par job; le job build ne déploie pas les PR; le job deploy seul possède `pages: write` et `id-token: write`. Audit complet npm bloquant à partir de moderate, runtime Node 22 LTS et dépendances npm/actions GitHub suivis par Dependabot. |

## Changements de code

- `contact.html`: honeypot, longueurs minimales, bouton avec libellé de chargement; retrait de l’action PHP.
- `assets/js/contact.js`: validation, nettoyage des caractères de contrôle, appels EmailJS asynchrones, erreurs/succès accessibles, cooldown et repli `mailto:` prérempli si les variables manquent.
- `assets/css/contact.css`: masquage du honeypot et indicateur de chargement.
- `vite.config.js`: CSP stricte injectée avant les ressources et Referrer-Policy meta. Aucune directive `unsafe-eval`.
- `.github/workflows/deploy-pages.yml`: injection des variables publiques au build, audit npm, build sur PR sans publication et droits minimaux pour le déploiement Pages.
- `.env.example`: noms des seules variables nécessaires, valeurs vides.
- `.github/dependabot.yml`: mises à jour hebdomadaires des paquets npm et actions GitHub.

### Variables de build

```dotenv
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

Pour l’envoi direct via EmailJS, créer ces trois variables dans **Settings → Secrets and variables → Actions → Variables** avec les mêmes noms sans le préfixe `VITE_` (`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`). En leur absence, le formulaire prépare le message dans l’application mail de l’utilisateur. Les variables sont publiques dans le bundle; ne jamais y placer une clé privée.

## Configuration EmailJS

1. Créer un service EmailJS et un template destinataire dont l’adresse de destination est fixe et contrôlée par la propriétaire du site.
2. Définir les variables de template `from_name`, `reply_to`, `subject` et `message`; utiliser `{{from_name}}`, `{{reply_to}}`, `{{subject}}` et `{{message}}` dans le corps du message. Utiliser `reply_to` pour répondre à l’expéditeur, ne pas faire de son adresse le destinataire.
3. Copier le Service ID, Template ID et Public Key dans `.env.local` pour le développement, ou dans les variables GitHub Actions pour Pages. Ne pas ajouter `.env.local` à Git.
4. Dans la console EmailJS, restreindre **Allowed Origins / Domain allowlist** à `https://ambre66160.github.io` (et à l’origine locale uniquement pour les essais). Activer les protections anti-abus/CAPTCHA disponibles dans le compte et vérifier les limites d’envoi.
5. Après déploiement, tester succès, réponse refusée, timeout, cooldown, honeypot et validation depuis la page Contact.

## Vérifications

- `npm run build` avec Node 22.13.1 : réussi.
- `npm audit --omit=dev --audit-level=high` : zéro vulnérabilité de production.
- L’audit complet après mises à jour compatibles laisse deux avis low dans la dépendance de build `motion-studio`/`esbuild`.
- Parcours navigateur simulé : succès sans navigation et reset seulement après HTTP 200; cooldown sans requête; échec HTTP 503 avec données conservées; honeypot sans requête.
- La configuration de domaine EmailJS et le réglage **Enforce HTTPS** sont des opérations dans les consoles externes et ne peuvent pas être vérifiées/modifiées depuis ce dépôt.
