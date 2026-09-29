# Portfolio d'Ambre

Portfolio personnel construit en PHP natif, HTML et CSS.

## Lancer en local

Depuis la racine du projet, avec PHP 8.1 ou supérieur :

```sh
php -S 127.0.0.1:8000 -t .
```

Ouvrir ensuite `http://127.0.0.1:8000/index.php`.

Les projets sont décrits dans `config/projets.json` et affichés par `projets.php` et le template `projet-detail.php?slug=...`.

Le formulaire de contact utilise la fonction PHP `mail()`. Le serveur doit être configuré pour envoyer des e-mails.
