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

    // NOUVELLE MÉTHODE pour charger les polices depuis /fonts
    public function getFonts()
    {
        header('Content-Type: application/json');

        $fontsDir = __DIR__ . '/../fonts';
        $fonts = ['BARCODE']; // Ajouter BARCODE en premier

        if (!is_dir($fontsDir)) {
            echo json_encode($fonts);
            return;
        }

        // Scanner récursivement le dossier fonts
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($fontsDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $ext = strtolower($file->getExtension());
                if (in_array($ext, ['ttf', 'otf'])) {
                    // Extraire le nom du fichier sans extension
                    $fontName = pathinfo($file->getFilename(), PATHINFO_FILENAME);

                    // Nettoyer le nom
                    $fontName = str_replace('_', ' ', $fontName);

                    if (!in_array($fontName, $fonts)) {
                        $fonts[] = $fontName;
                    }
                }
            }
        }

        sort($fonts);

        // Remettre BARCODE en premier
        $fonts = array_diff($fonts, ['BARCODE']);
        array_unshift($fonts, 'BARCODE');

        echo json_encode($fonts);
    }
}
