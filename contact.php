<?php

session_start();
require_once __DIR__ . '/includes/functions.php';

if (!isset($_SESSION['contact_csrf'])) {
    $_SESSION['contact_csrf'] = bin2hex(random_bytes(32));
}

$form_data = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];
$errors = [];
$status = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($form_data as $field => $_value) {
        $posted_value = $_POST[$field] ?? '';
        $form_data[$field] = is_string($posted_value) ? trim($posted_value) : '';
    }

    $csrf = $_POST['csrf_token'] ?? '';
    if (!is_string($csrf) || !hash_equals($_SESSION['contact_csrf'], $csrf)) {
        $errors[] = 'La session du formulaire a expiré. Rechargez la page puis réessayez.';
    }

    if ($form_data['name'] === '' || strlen($form_data['name']) > 150) {
        $errors[] = 'Indiquez votre nom (150 caractères maximum).';
    }

    if (!filter_var($form_data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Indiquez une adresse e-mail valide.';
    }

    if (strlen($form_data['subject']) > 180) {
        $errors[] = 'Le sujet ne peut pas dépasser 180 caractères.';
    }

    if ($form_data['message'] === '' || strlen($form_data['message']) > 8000) {
        $errors[] = 'Le message est requis et doit faire au maximum 8 000 caractères.';
    }

    if ($errors === []) {
        $subject = $form_data['subject'] !== '' ? $form_data['subject'] : 'Message du portfolio';
        $encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $body = implode("\n", [
            'Nom : ' . $form_data['name'],
            'E-mail : ' . $form_data['email'],
            '',
            $form_data['message'],
        ]);
        $headers = implode("\r\n", [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $form_data['email'],
        ]);

        if (mail('ambre.florette@etu.cyu.fr', $encoded_subject, $body, $headers)) {
            $status = 'Merci, votre message a bien été envoyé.';
            $form_data = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];
            $_SESSION['contact_csrf'] = bin2hex(random_bytes(32));
        } else {
            $errors[] = 'L’envoi est momentanément indisponible. Vous pouvez écrire directement à ambre.florette@etu.cyu.fr.';
        }
    }
}

$page_active = 'contact';
$page_title = 'Contact — Ambre, Dev & Design';
$page_description = 'Contactez Ambre pour une opportunité, un projet web ou une conversation autour du design et de l’architecture logicielle.';
$body_class = 'contact-page';
$page_styles = ['projets.css', 'contact.css'];
require_once __DIR__ . '/includes/header.php';
?>
<main class="contact-main">
    <div class="contact-layout">
        <section class="contact-column" aria-labelledby="contact-title">
            <header class="contact-heading">
                <p class="contact-heading__eyebrow"><span></span> Discutons de votre projet</p>
                <h1 id="contact-title">Contactez-moi<span> !</span></h1>
                <p>Une opportunité de stage, une idée de projet innovant ou simplement envie de parler design et architecture logicielle autour d'un bon café ? Envoyez-moi un message !</p>
            </header>

            <address class="contact-details" aria-label="Coordonnées directes">
                <a class="contact-detail" href="mailto:ambre.florette@etu.cyu.fr"><span class="contact-detail__icon" aria-hidden="true">@</span><span><small>Email</small><strong>ambre.florette@etu.cyu.fr</strong></span></a>
                <a class="contact-detail" href="tel:+33778947558"><span class="contact-detail__icon" aria-hidden="true">☎</span><span><small>Téléphone</small><strong>07 78 94 75 58</strong></span></a>
                <div class="contact-detail"><span class="contact-detail__icon" aria-hidden="true">⌖</span><span><small>Localisation</small><strong>Pau, France — mobile</strong></span></div>
            </address>

            <form class="contact-form" id="contact-form" action="contact.php#contact-form" method="post">
                <div class="contact-form__top"><h2>Votre message</h2><span>Les champs marqués * sont requis</span></div>
                <?php if ($errors !== []): ?>
                    <div class="contact-form__feedback contact-form__feedback--error" role="alert"><ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?></ul></div>
                <?php elseif ($status !== ''): ?>
                    <p class="contact-form__feedback contact-form__feedback--success" role="status"><?= e($status) ?></p>
                <?php endif; ?>
                <input type="hidden" name="csrf_token" value="<?= e($_SESSION['contact_csrf']) ?>">
                <div class="contact-form__fields">
                    <div class="contact-field"><label for="contact-name">Nom / Prénom <span>*</span></label><input id="contact-name" name="name" type="text" placeholder="Votre nom" autocomplete="name" maxlength="150" value="<?= e($form_data['name']) ?>" required></div>
                    <div class="contact-field"><label for="contact-email">Adresse e-mail <span>*</span></label><input id="contact-email" name="email" type="email" placeholder="votre.email@exemple.com" autocomplete="email" value="<?= e($form_data['email']) ?>" required></div>
                    <div class="contact-field contact-field--full"><label for="contact-subject">Sujet</label><input id="contact-subject" name="subject" type="text" placeholder="Sujet de votre message" maxlength="180" value="<?= e($form_data['subject']) ?>"></div>
                    <div class="contact-field contact-field--full"><label for="contact-message">Message <span>*</span></label><textarea id="contact-message" name="message" rows="5" maxlength="8000" placeholder="Bonjour Ambre, je vous contacte pour..." required><?= e($form_data['message']) ?></textarea></div>
                </div>
                <div class="contact-form__actions"><button class="button contact-form__submit" type="submit">Envoyer le message <span aria-hidden="true">→</span></button></div>
            </form>
        </section>

        <aside class="contact-socials" aria-labelledby="social-title">
            <div class="contact-socials__heading"><p>En dehors de la boîte mail</p><h2 id="social-title">Retrouvons-nous<br>ailleurs<span>.</span></h2></div>
            <div class="contact-socials__grid">
                <a class="social-card" href="https://github.com/ambre_66160" target="_blank" rel="noreferrer"><span class="social-card__icon" aria-hidden="true">GH</span><span class="social-card__label">GitHub :</span><strong>ambre_66160</strong><span class="social-card__arrow" aria-hidden="true">↗</span></a>
                <a class="social-card" href="https://www.instagram.com/ambre_33160/" target="_blank" rel="noreferrer"><span class="social-card__icon social-card__icon--instagram" aria-hidden="true">◎</span><span class="social-card__label">Instagram :</span><strong>ambre_33160</strong><span class="social-card__arrow" aria-hidden="true">↗</span></a>
                <a class="social-card" href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><span class="social-card__icon social-card__icon--linkedin" aria-hidden="true">in</span><span class="social-card__label">LinkedIn</span><strong>Profil professionnel</strong><span class="social-card__arrow" aria-hidden="true">↗</span></a>
                <a class="social-card" href="mailto:ambre.florette@etu.cyu.fr?subject=Contact%20Discord" aria-label="Demander le contact Discord par e-mail"><span class="social-card__icon social-card__icon--discord" aria-hidden="true">♡</span><span class="social-card__label">Discord :</span><strong>Sur demande</strong><span class="social-card__arrow" aria-hidden="true">↗</span></a>
            </div>
            <p class="contact-socials__note">Un projet en tête ? Je serai ravie d'en discuter avec vous.</p>
        </aside>
    </div>
</main>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
