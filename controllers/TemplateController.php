<?php
require_once __DIR__ . '/../models/TemplateModel.php';

class TemplateController
{
    private $model;

    public function __construct()
    {
        $this->model = new TemplateModel();
    }

    public function index()
    {
        $templates = $this->model->getAll();
        require __DIR__ . '/../views/template/index.php';
    }

    public function edit($id)
    {
        $template = $this->model->getById($id);
        if (!$template) {
            header('Location: ' . BASE_PATH . '/');
            exit;
        }
        require __DIR__ . '/../views/template/edit.php';
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'name' => $_POST['name'] ?? 'Nouveau template',
                'width' => $_POST['width'] ?? 210,
                'height' => $_POST['height'] ?? 99
            ];

            // Upload image si présente
            if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
                $uploadDir = __DIR__ . '/../public/uploads/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                $filename = uniqid() . '_' . basename($_FILES['image']['name']);
                $uploadPath = $uploadDir . $filename;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                    $data['image_path'] = '/uploads/' . $filename;
                }
            }

            $id = $this->model->create($data);
            header('Location: ' . BASE_PATH . '/template/edit/' . $id);
            exit;
        }
    }

    public function save()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['id']) || !isset($data['zones'])) {
            echo json_encode(['success' => false, 'error' => 'Données manquantes']);
            return;
        }

        $result = $this->model->update($data['id'], [
            'zones' => json_encode($data['zones'])
        ]);

        echo json_encode(['success' => $result]);
    }

    public function delete($id)
    {
        $this->model->delete($id);
        header('Location: ' . BASE_PATH . '/');
        exit;
    }

    // controllers/TemplateController.php - Modifier getFonts()
    // méthode avec fussy search
    public function getFonts()
    {
        header('Content-Type: application/json');

        $fontsDir = __DIR__ . '/../fonts';
        $fonts = [
            ['name' => 'BARCODE', 'path' => null] // Police spéciale
        ];

        if (!is_dir($fontsDir)) {
            echo json_encode($fonts);
            return;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($fontsDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        // controllers/TemplateController.php - Modifier dans getFonts()
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $ext = strtolower($file->getExtension());
                if (in_array($ext, ['ttf', 'otf'])) {
                    $fontName = pathinfo($file->getFilename(), PATHINFO_FILENAME);
                    $fontName = str_replace('_', ' ', $fontName);

                    // Chemin relatif depuis le dossier fonts
                    $relativePath = str_replace('\\', '/', substr($file->getPathname(), strlen($fontsDir) + 1));

                    $fonts[] = [
                        'name' => $fontName,
                        'path' => BASE_PATH . '/fonts/' . $relativePath, // Via la route PHP
                        'format' => $ext === 'ttf' ? 'truetype' : 'opentype'
                    ];
                }
            }
        }
        // Trier par nom (BARCODE reste en premier)
        usort($fonts, function ($a, $b) {
            if ($a['name'] === 'BARCODE') return -1;
            if ($b['name'] === 'BARCODE') return 1;
            return strcasecmp($a['name'], $b['name']);
        });

        echo json_encode($fonts);
    }

    // controllers/TemplateController.php
    public function serveFont($fontPath)
    {
        $fontsDir = __DIR__ . '/../fonts';
        $fullPath = realpath($fontsDir . '/' . $fontPath);

        // Sécurité : vérifier que le chemin est bien dans fonts/
        if (!$fullPath || strpos($fullPath, realpath($fontsDir)) !== 0) {
            header('HTTP/1.0 404 Not Found');
            exit;
        }

        if (!file_exists($fullPath)) {
            header('HTTP/1.0 404 Not Found');
            exit;
        }

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $contentType = $ext === 'ttf' ? 'font/ttf' : 'font/otf';

        header('Content-Type: ' . $contentType);
        header('Cache-Control: public, max-age=31536000');
        readfile($fullPath);
        exit;
    }
}
