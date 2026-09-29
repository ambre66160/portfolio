<?php

require_once __DIR__ . '/includes/functions.php';

$projects = load_projects();
$page_active = 'projets';
$page_title = 'Projets — Ambre, Dev & Design';
$page_description = 'Découvrez les projets conçus par Ambre : applications web, foodtech et produits responsables.';
$body_class = 'projects-page';
$page_styles = ['projets.css'];
require_once __DIR__ . '/includes/header.php';
?>
<main>
    <section class="projects-intro" aria-labelledby="projects-title">
        <p class="projects-intro__eyebrow"><span></span> Travaux choisis</p>
        <h1 id="projects-title">Des applications pensées comme des recettes étoilées<span>.</span></h1>
        <div class="projects-intro__bottom">
            <p>Des produits utiles, construits avec méthode et une attention particulière portée à celles et ceux qui les utilisent.</p>
            <span class="projects-intro__count">01 <i>/</i> <?= count($projects) ?> projets</span>
        </div>
    </section>

    <section class="projects-list" aria-label="Sélection de projets">
        <?php foreach ($projects as $index => $project): ?>
            <article class="project-card project-card--<?= e($project['slug']) ?>">
                <?php if (!empty($project['image_hero'])): ?>
                    <div class="project-card__visual project-card__visual--image">
                        <img src="<?= e($project['image_hero']) ?>" alt="Aperçu du projet <?= e($project['title']) ?>" loading="lazy" decoding="async">
                        <span class="project-card__visual-caption"><?= e($project['type']) ?> <i>·</i> <?= e($project['duration']) ?></span>
                    </div>
                <?php else: ?>
                    <div class="project-card__visual project-card__visual--placeholder project-card__visual--<?= e($project['slug']) ?>" role="img" aria-label="Aperçu graphique de <?= e($project['title']) ?>">
                        <span class="project-placeholder__index">0<?= $index + 1 ?> / ÉTUDE DE CAS</span>
                        <strong><?= e($project['title']) ?></strong>
                        <span class="project-card__visual-caption"><?= e($project['type']) ?> <i>·</i> <?= e($project['duration']) ?></span>
                    </div>
                <?php endif; ?>
                <div class="project-card__content">
                    <div class="project-card__meta"><span>0<?= $index + 1 ?> / <?= e($project['type']) ?></span><span class="project-card__meta-dot" aria-hidden="true"></span></div>
                    <h2><?= e($project['title']) ?></h2>
                    <p class="project-card__role"><?= e($project['role']) ?></p>
                    <p class="project-card__description"><?= e($project['subtitle']) ?></p>
                    <ul class="project-card__stack" aria-label="Technologies utilisées">
                        <?php foreach ($project['technologies'] as $technology): ?><li><?= e($technology) ?></li><?php endforeach; ?>
                    </ul>
                    <a class="project-detail-link" href="projet-detail.php?slug=<?= rawurlencode($project['slug']) ?>">Lire l'étude de cas <span aria-hidden="true">→</span></a>
                </div>
            </article>
        <?php endforeach; ?>
    </section>
</main>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
