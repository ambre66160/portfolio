<?php

declare(strict_types=1);

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function load_projects(): array
{
    $path = dirname(__DIR__) . '/config/projets.json';
    $contents = file_get_contents($path);

    if ($contents === false) {
        throw new RuntimeException('Impossible de lire la liste des projets.');
    }

    $projects = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);

    if (!is_array($projects)) {
        throw new RuntimeException('Le fichier de projets doit contenir une liste.');
    }

    return $projects;
}
