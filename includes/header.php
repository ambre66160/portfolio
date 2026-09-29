<?php

require_once __DIR__ . '/functions.php';

$page_title = $page_title ?? 'Ambre — Développeuse full stack';
$page_description = $page_description ?? 'Portfolio d’Ambre, développeuse full stack.';
$page_active = $page_active ?? '';
$body_class = $body_class ?? '';
$page_styles = $page_styles ?? [];
$asset_version = static function (string $path): string {
    $file_path = dirname(__DIR__) . '/assets/' . ltrim($path, '/');

    return is_file($file_path) ? (string) filemtime($file_path) : '1';
};

header('Cache-Control: no-cache, must-revalidate');
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#1e0b0b">
    <meta name="description" content="<?= e($page_description) ?>">
    <title><?= e($page_title) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css?v=<?= e($asset_version('css/style.css')) ?>">
    <link rel="stylesheet" href="assets/css/components.css?v=<?= e($asset_version('css/components.css')) ?>">
    <link rel="stylesheet" href="assets/css/responsive.css?v=<?= e($asset_version('css/responsive.css')) ?>">
    <?php foreach ($page_styles as $page_style): ?>
        <?php $page_style = basename($page_style); ?>
        <link rel="stylesheet" href="assets/css/<?= e($page_style) ?>?v=<?= e($asset_version('css/' . $page_style)) ?>">
    <?php endforeach; ?>
    <script src="assets/js/main.js?v=<?= e($asset_version('js/main.js')) ?>" defer></script>
</head>
<body class="<?= e($body_class) ?>">
<header class="projects-header<?= $page_active === 'accueil' ? ' projects-header--home' : '' ?>">
    <nav class="projects-nav" aria-label="Navigation principale">
        <a class="projects-brand" href="index.php" aria-label="Ambre, accueil">
            <span class="projects-brand__mark" aria-hidden="true">A</span>
            <span class="projects-brand__name">Ambre <i>·</i> Dev Full Stack</span>
        </a>
        <button class="site-nav__toggle projects-nav__toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Ouvrir le menu">
            <span></span><span></span>
        </button>
        <div class="projects-nav__menu" id="site-menu">
            <?php
            $navigation = [
                'accueil' => ['index.php', 'Accueil'],
                'projets' => ['projets.php', 'Projets'],
                'qui-suis-je' => ['qui-suis-je.php', 'Qui suis-je'],
                'competences' => ['competences.php', 'Compétences'],
                'contact' => ['contact.php', 'Contact'],
            ];
            foreach ($navigation as $key => [$href, $label]):
                $is_active = $page_active === $key;
            ?>
                <a href="<?= e($href) ?>"<?= $is_active ? ' class="active" aria-current="page"' : '' ?>><?= e($label) ?></a>
            <?php endforeach; ?>
        </div>
        <a class="button projects-nav__hire" href="contact.php">Me recruter <span aria-hidden="true">↗</span></a>
    </nav>
</header>
