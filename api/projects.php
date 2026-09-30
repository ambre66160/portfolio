<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$respond = static function (int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
};

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    $respond(405, ['error' => ['code' => 'method_not_allowed', 'message' => 'Méthode non autorisée.']]);
}

$path = dirname(__DIR__) . '/config/projets.json';
$contents = file_get_contents($path);

if ($contents === false) {
    $respond(500, ['error' => ['code' => 'projects_unavailable', 'message' => 'Les projets sont momentanément indisponibles.']]);
}

try {
    $projects = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    $respond(500, ['error' => ['code' => 'invalid_project_data', 'message' => 'Les données des projets sont invalides.']]);
}

if (!is_array($projects)) {
    $respond(500, ['error' => ['code' => 'invalid_project_data', 'message' => 'Les données des projets sont invalides.']]);
}

if (!array_key_exists('slug', $_GET)) {
    $respond(200, ['data' => $projects]);
}

$slug = $_GET['slug'];
if (!is_string($slug) || !preg_match('/^[a-z0-9-]+$/', $slug)) {
    $respond(400, ['error' => ['code' => 'invalid_slug', 'message' => 'Le slug demandé est invalide.']]);
}

foreach ($projects as $project) {
    if (is_array($project) && ($project['slug'] ?? null) === $slug) {
        $respond(200, ['data' => $project]);
    }
}

$respond(404, ['error' => ['code' => 'project_not_found', 'message' => 'Ce projet est introuvable.']]);