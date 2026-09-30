<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$respond = static function (int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
};

$is_https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $csrf_token = bin2hex(random_bytes(32));
    setcookie('contact_csrf', $csrf_token, [
        'expires' => time() + 1800,
        'path' => '/api/contact.php',
        'secure' => $is_https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    $respond(200, ['data' => ['csrfToken' => $csrf_token]]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    $respond(405, ['error' => ['code' => 'method_not_allowed', 'message' => 'Méthode non autorisée.']]);
}

$csrf_header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
$csrf_cookie = $_COOKIE['contact_csrf'] ?? '';
if (!is_string($csrf_header) || !is_string($csrf_cookie) || $csrf_header === '' || !hash_equals($csrf_cookie, $csrf_header)) {
    $respond(403, ['error' => ['code' => 'csrf_invalid', 'message' => 'Le formulaire a expiré. Rechargez la page puis réessayez.']]);
}

if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    $respond(415, ['error' => ['code' => 'unsupported_media_type', 'message' => 'Le contenu doit être envoyé au format JSON.']]);
}

try {
    $payload = json_decode(file_get_contents('php://input') ?: '', true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    $respond(400, ['error' => ['code' => 'invalid_json', 'message' => 'Le corps de la requête JSON est invalide.']]);
}

if (!is_array($payload)) {
    $respond(400, ['error' => ['code' => 'invalid_payload', 'message' => 'Les données du formulaire sont invalides.']]);
}

$fields = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];
foreach ($fields as $field => $_value) {
    $value = $payload[$field] ?? '';
    $fields[$field] = is_string($value) ? trim($value) : '';
}

$length = static function (string $value): int {
    $count = preg_match_all('/./us', $value, $matches);
    return $count === false ? strlen($value) : $count;
};

$errors = [];
if ($fields['name'] === '' || $length($fields['name']) > 150) {
    $errors['name'] = 'Indiquez votre nom (150 caractères maximum).';
}
if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL) || $length($fields['email']) > 254) {
    $errors['email'] = 'Indiquez une adresse e-mail valide (254 caractères maximum).';
}
if ($length($fields['subject']) > 180) {
    $errors['subject'] = 'Le sujet ne peut pas dépasser 180 caractères.';
}
if ($fields['message'] === '' || $length($fields['message']) > 8000) {
    $errors['message'] = 'Le message est requis et doit faire au maximum 8 000 caractères.';
}

if ($errors !== []) {
    $respond(422, ['error' => ['code' => 'validation_failed', 'message' => 'Certains champs sont à corriger.', 'fields' => $errors]]);
}

$subject = $fields['subject'] !== '' ? $fields['subject'] : 'Message du portfolio';
$encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$body = implode("\n", [
    'Nom : ' . $fields['name'],
    'E-mail : ' . $fields['email'],
    '',
    $fields['message'],
]);
$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Reply-To: ' . $fields['email'],
]);

if (!mail('ambre.florette@etu.cyu.fr', $encoded_subject, $body, $headers)) {
    $respond(503, ['error' => ['code' => 'mail_unavailable', 'message' => 'L’envoi est momentanément indisponible. Vous pouvez écrire directement à ambre.florette@etu.cyu.fr.']]);
}

$respond(200, ['data' => ['message' => 'Merci, votre message a bien été envoyé.']]);