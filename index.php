<?php
// ========================================
// public/index.php
// ========================================

error_reporting(E_ALL);
ini_set('display_errors', 1);
define('BASE_PATH', dirname($_SERVER['SCRIPT_NAME']));
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/TemplateController.php';
require_once __DIR__ . '/routes.php';

route($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
