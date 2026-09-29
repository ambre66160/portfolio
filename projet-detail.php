<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/functions.php';

$raw_slug = $_GET['slug'] ?? '';
$requested_slug = htmlspecialchars(is_string($raw_slug) ? $raw_slug : '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$projects = load_projects();
$project = null;

foreach ($projects as $candidate) {
    if (hash_equals((string) $candidate['slug'], $requested_slug)) {
        $project = $candidate;
        break;
    }
}

$next_project = null;
if ($project !== null && !empty($project['next_project_slug'])) {
    foreach ($projects as $candidate) {
        if (hash_equals((string) $candidate['slug'], (string) $project['next_project_slug'])) {
            $next_project = $candidate;
            break;
        }
    }
}

if ($project === null) {
    http_response_code(404);
    $page_active = 'projets';
    $page_title = 'Projet introuvable — Ambre';
    $page_description = 'Cette fiche projet n’existe pas.';
    $body_class = 'case-study';
    $page_styles = ['projets.css', 'etude-projet.css'];
    require_once __DIR__ . '/includes/header.php';
    ?>
    <main class="case-study__main">
        <div class="case-study__container project-not-found">
            <p class="project-eyebrow">Erreur 404 <span>/</span> Fiche introuvable</p>
            <h1>Ce projet est introuvable<span>.</span></h1>
            <p>Le lien est peut-être incomplet ou la fiche n'est plus disponible.</p>
            <a class="button" href="projets.php">Retour aux projets <span aria-hidden="true">→</span></a>
        </div>
    </main>
    <?php
    require_once __DIR__ . '/includes/footer.php';
    exit;
}

$page_active = 'projets';
$page_title = $project['title'] . ' — Étude de cas | Ambre';
$page_description = $project['subtitle'];
$banner_image = $project['image_banner'] ?? '';
$body_class = 'case-study' . ($project['slug'] === 'marmiton-numerique' ? ' case-study--marmiton' : '');
$page_styles = ['projets.css', 'etude-projet.css'];
require_once __DIR__ . '/includes/header.php';
?>
<main class="case-study__main">
    <div class="case-study__container">
        <section class="project-hero" aria-labelledby="project-title">
            <p class="project-eyebrow">Détail du projet <span>/</span> Étude de cas</p>
            <h1 id="project-title"><?= e($project['title']) ?><span>.</span></h1>
            <p class="project-hero__subtitle"><?= e($project['subtitle']) ?></p>
        </section>

        <dl class="project-meta" aria-label="Informations sur le projet">
            <div><dt>Rôle</dt><dd><?= e($project['role']) ?></dd></div>
            <div><dt>Durée</dt><dd><?= e($project['duration']) ?></dd></div>
            <div><dt>Technologies</dt><dd><?= e(implode(', ', $project['technologies'])) ?></dd></div>
            <div><dt>Typologie</dt><dd><?= e($project['type']) ?></dd></div>
        </dl>

        <figure class="project-hero__visual<?= $banner_image !== '' ? ' project-hero__visual--animated' : (empty($project['image_hero']) ? ' project-hero__visual--placeholder' : '') ?>"<?= $banner_image !== '' ? ' style="background-image: linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.4)), url(&quot;' . e($banner_image) . '&quot;);"' : '' ?>>
            <?php if ($banner_image === '' && !empty($project['image_hero'])): ?>
                <img src="<?= e($project['image_hero']) ?>" alt="Aperçu de <?= e($project['title']) ?>" fetchpriority="high">
            <?php elseif ($banner_image === ''): ?>
                <div class="project-visual-placeholder" aria-hidden="true"><span><?= e(strtoupper(substr($project['title'], 0, 1))) ?></span><strong><?= e($project['title']) ?></strong><small><?= e($project['type']) ?></small></div>
            <?php endif; ?>
            <div class="project-hero__overlay<?= $banner_image !== '' ? ' project-hero__overlay--center' : '' ?>"><span><?= e(strtoupper($project['type'])) ?></span><h2><?= e($project['title']) ?></h2><p class="project-hero__overlay-subtitle"><?= e($project['duration']) ?></p></div>
            <figcaption><?= e($project['title']) ?> — <?= e($project['subtitle']) ?></figcaption>
        </figure>

        <?php if (!empty($project['metrics'])): ?>
            <section class="project-metrics" aria-label="Chiffres clés du projet">
                <?php foreach ($project['metrics'] as $metric): ?>
                    <article class="metric-card"><strong><?= e($metric['value']) ?></strong><p><?= e($metric['label']) ?></p></article>
                <?php endforeach; ?>
            </section>
        <?php endif; ?>

        <section class="project-context" aria-labelledby="context-title">
            <div class="project-copy">
                <p class="project-eyebrow">01 <span>/</span> Le point de départ</p>
                <h2 id="context-title">Le contexte &amp;<br>le problème</h2>
                <p><?= nl2br(e($project['context'])) ?></p>
            </div>
            <?php if (!empty($project['image_context'])): ?>
                <figure class="project-context__visual">
                    <img src="<?= e($project['image_context']) ?>" alt="Aperçu de la solution <?= e($project['title']) ?>" loading="lazy" decoding="async">
                    <figcaption>Une expérience claire, au service des usages.</figcaption>
                </figure>
            <?php else: ?>
                <div class="project-context__visual project-context__visual--inventory" role="img" aria-label="Illustration synthétique du contexte <?= e($project['title']) ?>">
                    <span><?= e(strtoupper($project['type'])) ?></span><strong><?= e($project['title']) ?></strong>
                    <div><i></i><b><?= e($project['technologies'][0] ?? 'Projet') ?></b><small><?= e($project['role']) ?></small></div>
                    <div><i></i><b><?= e($project['duration']) ?></b><small><?= e($project['type']) ?></small></div>
                </div>
            <?php endif; ?>
        </section>

        <section class="project-approach" aria-labelledby="approach-title">
            <header class="project-section-heading">
                <p class="project-eyebrow">02 <span>/</span> Concevoir avec intention</p>
                <h2 id="approach-title">La démarche &amp; les choix techniques</h2>
                <p>Des décisions techniques alignées sur les besoins du projet et de ses utilisateurs.</p>
            </header>
            <div class="approach-grid">
                <?php foreach ($project['approach'] as $index => $approach): ?>
                    <article class="approach-card"><span>0<?= $index + 1 ?></span><h3><?= e($approach['title']) ?></h3><p><?= e($approach['description']) ?></p></article>
                <?php endforeach; ?>
            </div>
            <?php if (!empty($project['code_snippet'])): ?>
                <div class="code-block" aria-label="Extrait de code">
                    <div class="code-block__bar" aria-hidden="true"><span></span><span></span><span></span><p><?= e($project['slug']) ?>.snippet</p></div>
                    <pre tabindex="0"><code><?= e($project['code_snippet']) ?></code></pre>
                </div>
            <?php endif; ?>
        </section>

        <section class="project-challenge" aria-labelledby="challenge-title">
            <div class="project-copy">
                <p class="project-eyebrow">03 <span>/</span> Résoudre l'essentiel</p>
                <h2 id="challenge-title">Le défi majeur<br>&amp; la solution</h2>
                <p><?= e($project['challenge']) ?></p>
                <p><?= e($project['solution']) ?></p>
            </div>
            <div class="learning-stack">
                <article class="learning-card"><span>Ce que j'ai appris</span><h3>La cohérence se construit dans les détails.</h3><p>Une architecture utile rend les prochaines décisions et évolutions plus simples.</p></article>
                <article class="learning-card learning-card--accent"><span>L'impact à long terme</span><h3>Une expérience bien pensée accompagne les usages.</h3><p>Un produit réussi reste utile, clair et agréable à utiliser dans la durée.</p></article>
            </div>
        </section>
    </div>

    <?php if ($next_project !== null): ?>
        <section class="next-project-banner" aria-labelledby="next-project-title">
            <div class="next-project-banner__inner">
                <p>Projet suivant <span>↗</span></p>
                <h2 id="next-project-title"><?= e($next_project['title']) ?> <i>—</i> <?= e($next_project['subtitle']) ?></h2>
                <a href="projet-detail.php?slug=<?= rawurlencode($next_project['slug']) ?>">Voir le projet <span aria-hidden="true">→</span></a>
            </div>
        </section>
    <?php endif; ?>
</main>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
