<?php
// ========================================
// controllers/CheckController.php
// ========================================

require_once __DIR__ . '/../models/TemplateModel.php';

class CheckController
{
    private $templateModel;

    public function __construct()
    {
        $this->templateModel = new TemplateModel();
    }

    public function index()
    {
        $templates = $this->templateModel->getAll();
        require __DIR__ . '/../views/check/index.php';
    }

    public function generateBatch()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['templates'])) {
            echo json_encode(['success' => false, 'error' => 'Données manquantes']);
            return;
        }

        $output = [
            'generated_at' => date('Y-m-d H:i:s'),
            'templates' => []
        ];

        foreach ($data['templates'] as $item) {
            $template = $this->templateModel->getById($item['id']);
            if (!$template || $item['count'] <= 0) continue;

            $zones = json_decode($template['zones'], true) ?: [];

            // Appliquer le texte à toutes les zones
            $zonesWithText = array_map(function ($zone) use ($item) {
                $zone['text'] = $item['text'];
                return $zone;
            }, $zones);

            $output['templates'][] = [
                'template_name' => $template['name'],
                'template_id' => $template['id'],
                'image_path' => $template['image_path'],
                'width' => $template['width'],
                'height' => $template['height'],
                'count' => $item['count'],
                'zones' => $zonesWithText
            ];
        }

        echo json_encode($output, JSON_PRETTY_PRINT);
    }
}
