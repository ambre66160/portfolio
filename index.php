<?php

require_once __DIR__ . '/includes/functions.php';

$projects = load_projects();
$projects_by_slug = array_column($projects, null, 'slug');
$featured_slugs = ['ekoroji', 'atelier', 'ambre-portfolio'];
$page_active = 'accueil';
$page_title = 'Ambre — Développeuse full stack';
$page_description = 'Le portfolio d’Ambre, développeuse full stack. Parcours, compétences et projets web.';
$body_class = 'home-page';
$page_styles = ['projets.css'];
require_once __DIR__ . '/includes/header.php';
?>
<section class="hero" id="accueil" aria-labelledby="home-title">
    <div class="hero__content">
        <div class="hero__title-center">
            <div class="hero__title-wrap">
                <p class="hero__vertical">Développeuse <br> Full Stack</p>
                <span class="hero__spark" aria-hidden="true">✦</span>
                <h1 class="hero__title" id="home-title">Port<br>Folio</h1>
                <p class="hero__version">2026 version</p>
            </div>
        </div>
        <p class="hero__signature">Ambre <p> 
    </div>
</section>

<main>
    <div class="marquee" aria-label="Technologies : HTML, CSS, JavaScript, Java, Python, SQL, Flask, C, React et JEE">
        <p class="visually-hidden">HTML — CSS — JavaScript — Java — Python — SQL — Flask — C — React — JEE</p>
        <div class="marquee__track" aria-hidden="true">
            <span>HTML <i>—</i> CSS <i>—</i> JavaScript <i>—</i> Java <i>—</i> Python <i>—</i> SQL <i>—</i> Flask <i>—</i> C <i>—</i> React <i>—</i> JEE <i>—</i></span>
            <span>HTML <i>—</i> CSS <i>—</i> JavaScript <i>—</i> Java <i>—</i> Python <i>—</i> SQL <i>—</i> Flask <i>—</i> C <i>—</i> React <i>—</i> JEE <i>—</i></span>
        </div>
    </div>

    <section class="section about" id="quisuisje" aria-labelledby="about-title">
        <div class="section__eyebrow"><span>01</span> Un peu de moi</div>
        <div class="about__layout">
            <h2 class="section__title" id="about-title">Qui suis-je<span class="title-dot">?</span></h2>
            <div class="about__copy">
                <p class="about__lead">Je transforme les idées en expériences numériques utiles, belles et bien pensées.</p>
                <p>Développeuse full stack, j’aime autant imaginer une interface claire que comprendre ce qui se passe derrière. Curieuse et attentive aux détails, je construis des projets accessibles, solides et agréables à utiliser.</p>
                <a class="text-link" href="qui-suis-je.php">En savoir plus sur mon parcours <span aria-hidden="true">↗</span></a>
            </div>
        </div>
        <div class="about__note"><span class="about__note-mark" aria-hidden="true">✳</span><span>Basée en France<br>Disponible pour de nouveaux projets</span></div>
    </section>

    <div class="marquee marquee--light" aria-hidden="true">
        <div class="marquee__track"><span>HTML <i>—</i> CSS <i>—</i> JavaScript <i>—</i> Java <i>—</i> Python <i>—</i> SQL <i>—</i> Flask <i>—</i> C <i>—</i> React <i>—</i> JEE <i>—</i></span><span>HTML <i>—</i> CSS <i>—</i> JavaScript <i>—</i> Java <i>—</i> Python <i>—</i> SQL <i>—</i> Flask <i>—</i> C <i>—</i> React <i>—</i> JEE <i>—</i></span></div>
    </div>

    <section class="section experience" id="experiences" aria-labelledby="experience-title">
        <div class="section__eyebrow"><span>02</span> Ce qui me fait avancer</div>
        <div class="section__heading-row">
            <h2 class="section__title" id="experience-title">Mes expériences<span class="title-dot">.</span></h2>
            <p class="section__intro">Des idées qui prennent forme, des compétences qui se croisent et des projets qui ont du sens.</p>
        </div>
        <div class="experience__grid" id="competences">
            <article class="info-card"><div class="info-card__top"><span class="info-card__label">01 / À propos</span><a class="info-card__icon" href="qui-suis-je.php" aria-label="Découvrir mon profil">↗</a></div><h3>Curieuse<br>par nature.</h3><p>J’explore chaque étape d’un produit numérique, de la première esquisse à sa mise en ligne.</p><div class="tag-list"><span>Créativité</span><span>Curiosité</span></div><a class="info-card__link" href="qui-suis-je.php">Voir mon profil <span aria-hidden="true">→</span></a></article>
            <article class="info-card info-card--tint"><div class="info-card__top"><span class="info-card__label">02 / Développement</span><a class="info-card__icon" href="projets.php" aria-label="Découvrir mes projets">↗</a></div><h3>Du code<br>qui a du sens.</h3><p>Des interfaces réactives et des applications fiables, conçues avec soin et méthode.</p><div class="tag-list"><span>Front-end</span><span>Back-end</span></div><a class="info-card__link" href="projets.php">Voir les projets <span aria-hidden="true">→</span></a></article>
            <article class="info-card"><div class="info-card__top"><span class="info-card__label">03 / Ma méthode</span><a class="info-card__icon" href="contact.php" aria-label="Parler d'un projet">↗</a></div><h3>En équipe,<br>toujours.</h3><p>Écouter, partager et avancer ensemble pour trouver la réponse juste à chaque besoin.</p><div class="tag-list"><span>Collaboration</span><span>Agilité</span></div><a class="info-card__link" href="contact.php">Parlons-en <span aria-hidden="true">→</span></a></article>
            <article class="info-card info-card--dark"><div class="info-card__top"><span class="info-card__label">04 / Mes outils</span><a class="info-card__icon" href="competences.php" aria-label="Voir mes réalisations">↗</a></div><h3>Un outil<br>pour chaque idée.</h3><p>Je choisis les technologies qui servent le mieux le produit et les personnes qui l’utilisent.</p><div class="tag-list"><span>React</span><span>Java</span><span>SQL</span></div><a class="info-card__link" href="competences.php">Mes compétences <span aria-hidden="true">→</span></a></article>
        </div>
    </section>

    <div class="marquee marquee--light" aria-hidden="true">
        <div class="marquee__track"><span>HTML <i>—</i> CSS <i>—</i> JavaScript <i>—</i> Java <i>—</i> Python <i>—</i> SQL <i>—</i> Flask <i>—</i> C <i>—</i> React <i>—</i> JEE <i>—</i></span><span>HTML <i>—</i> CSS <i>—</i> JavaScript <i>—</i> Java <i>—</i> Python <i>—</i> SQL <i>—</i> Flask <i>—</i> C <i>—</i> React <i>—</i> JEE <i>—</i></span></div>
    </div>

    <section class="section projects" id="projets" aria-labelledby="projects-title">
        <div class="section__eyebrow"><span>03</span> Sélection choisie</div>
        <div class="section__heading-row"><h2 class="section__title" id="projects-title">Mes projets<span class="title-dot">.</span></h2><p class="section__intro">Quelques projets qui racontent ma façon de concevoir et de développer.</p></div>
        <div class="projects__grid">
            <?php foreach ($featured_slugs as $slug): ?>
                <?php if (!isset($projects_by_slug[$slug])) continue; $project = $projects_by_slug[$slug]; ?>
                <article class="project-card">
                    <?php if (!empty($project['image_hero'])): ?>
                        <div class="project-art project-art--eco project-art--data"><img src="<?= e($project['image_hero']) ?>" alt="" loading="lazy"><span class="project-art__wordmark"><?= e($project['title']) ?></span></div>
                    <?php else: ?>
                        <div class="project-art project-art--placeholder" role="img" aria-label="Aperçu du projet <?= e($project['title']) ?>"><span><?= e(mb_strtoupper(mb_substr($project['title'], 0, 1))) ?></span><strong><?= e($project['title']) ?></strong><small><?= e($project['type']) ?></small></div>
                    <?php endif; ?>
                    <div class="project-card__body">
                        <div class="project-card__meta"><span><?= e($project['type']) ?></span><span>2025</span></div>
                        <h3><?= e($project['title']) ?></h3>
                        <p class="project-card__role"><?= e($project['role']) ?></p>
                        <p><?= e($project['subtitle']) ?></p>
                        <div class="tag-list"><?php foreach ($project['technologies'] as $technology): ?><span><?= e($technology) ?></span><?php endforeach; ?></div>
                        <a class="button button--project" href="projet-detail.php?slug=<?= rawurlencode($project['slug']) ?>">Découvrir le projet <span aria-hidden="true">↗</span></a>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
        <p class="projects__all-link"><a class="text-link" href="projets.php">Voir tous les projets <span aria-hidden="true">→</span></a></p>
    </section>
</main>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
