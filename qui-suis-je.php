<?php

$page_active = 'qui-suis-je';
$page_title = 'Qui suis-je ? — Ambre, Dev & Design';
$page_description = 'Découvrez le parcours, les valeurs et les passions d’Ambre, développeuse full stack.';
$body_class = 'about-page';
$page_styles = ['projets.css', 'qui-suis-je.css'];
require_once __DIR__ . '/includes/header.php';
?>
<main class="about-main">
    <section class="about-layout" aria-labelledby="about-title">
        <div class="about-layout__portrait-column">
            <figure class="about-portrait">
                <img src="assets/images/femme.jpeg" alt="Portrait d'Ambre">
                <figcaption>Ambre <span>·</span> Dev &amp; Design</figcaption>
            </figure>
            <aside class="about-quote" aria-label="Une phrase qui me ressemble">
                <blockquote>
                    <p>« Le marbre est brut, l'assiette est dressée. Le code est pareil : de l'organisation pure naît l'harmonie absolue. »</p>
                    <footer>— Ambre</footer>
                </blockquote>
            </aside>
        </div>
        <div class="about-layout__content">
            <p class="about-eyebrow"><span></span> Mon parcours</p>
            <h1 id="about-title">Qui suis-je<span> ?</span></h1>
            <div class="about-copy">
                <p class="about-copy__lead">Je suis Ambre, développeuse en devenir, attirée par les projets où la précision technique rencontre le sens du détail.</p>
                <p>En Master 1 informatique, je consolide mes bases en conception et en développement logiciel. J'aime comprendre un problème dans son ensemble, structurer une solution, puis la faire évoluer avec méthode.</p>
                <p>La gastronomie m'inspire par son équilibre entre rigueur, créativité et partage. J'aborde le web avec le même regard : des interfaces accueillantes, des choix techniques réfléchis et une attention réelle à leur impact.</p>
                <p>Je m'intéresse particulièrement aux produits numériques éco-responsables, pensés pour durer et pour rendre les usages plus simples, sans perdre ce qui les rend humains.</p>
            </div>
            <section class="about-passions" aria-labelledby="passions-title">
                <div class="about-passions__heading"><h2 id="passions-title">Mes passions<span>.</span></h2><p>Trois façons de cultiver la patience et les idées.</p></div>
                <div class="passions-grid">
                    <article class="passion-card"><span class="passion-card__number">01</span><h3>Vélo de route</h3><p>Prendre la route, trouver son rythme et apprécier le paysage autant que la destination.</p></article>
                    <article class="passion-card"><span class="passion-card__number">02</span><h3>Crochet / Couture</h3><p>Créer de ses mains, recommencer un point et voir peu à peu une pièce prendre forme.</p></article>
                    <article class="passion-card"><span class="passion-card__number">03</span><h3>Programmation</h3><p>Assembler logique et imagination pour transformer une idée en quelque chose d'utile.</p></article>
                </div>
            </section>
        </div>
    </section>
</main>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
