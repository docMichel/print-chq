<?php

// ========================================
// routes.php
// ========================================


function route($uri, $method = 'GET')
{
    // Enlever le préfixe /templates
    $scriptPath = dirname($_SERVER['SCRIPT_NAME']);
    $uri = str_replace($scriptPath, '', $uri);

    $uri = parse_url($uri, PHP_URL_PATH);

    if (preg_match('#^' . preg_quote(BASE_PATH) . '/fonts/(.+)$#', $uri, $matches)) {
        $controller = new TemplateController();
        $controller->serveFont($matches[1]);
        return;
    }
    // Routes Templates
    if ($uri === '/' || $uri === '/template' || $uri === '/template/index') {
        $controller = new TemplateController();
        $controller->index();
        return;
    }

    if (preg_match('#^/template/edit/(\d+)$#', $uri, $matches)) {
        $controller = new TemplateController();
        $controller->edit($matches[1]);
        return;
    }

    if ($uri === '/template/create' && $method === 'POST') {
        $controller = new TemplateController();
        $controller->create();
        return;
    }

    if ($uri === '/template/save' && $method === 'POST') {
        $controller = new TemplateController();
        $controller->save();
        return;
    }

    if ($uri === '/template/fonts') {
        $controller = new TemplateController();
        $controller->getFonts();
        return;
    }

    if (preg_match('#^/template/delete/(\d+)$#', $uri, $matches)) {
        $controller = new TemplateController();
        $controller->delete($matches[1]);
        return;
    }

    // Routes Fabrication
    if ($uri === '/check' || $uri === '/check/index') {
        require_once __DIR__ . '/controllers/CheckController.php';
        $controller = new CheckController();
        $controller->index();
        return;
    }

    if ($uri === '/check/generate' && $method === 'POST') {
        require_once __DIR__ . '/controllers/CheckController.php';
        $controller = new CheckController();
        $controller->generateBatch();
        return;
    }

    // 404
    http_response_code(404);
    echo "Page non trouvée";
}
