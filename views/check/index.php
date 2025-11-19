<?php
// ========================================
// views/check/index.php
// ========================================

$title = 'Fabrication de Chèques';
ob_start();
?>

<div class="container">
    <div class="header-actions">
        <h2>Fabrication de chèques</h2>
        <a href="<?= BASE_PATH ?>/" class="btn">← Retour aux templates</a>
    </div>

    <form id="fabricationForm">
        <table class="fabrication-table">
            <thead>
                <tr>
                    <th>Template</th>
                    <th>Aperçu</th>
                    <th style="width: 120px;">Nombre</th>
                    <th>Texte</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($templates as $template): ?>
                    <tr data-template-id="<?= $template['id'] ?>">
                        <td>
                            <strong><?= htmlspecialchars($template['name']) ?></strong><br>
                            <small><?= $template['width'] ?> × <?= $template['height'] ?> mm</small><br>
                            <small><?= count(json_decode($template['zones'] ?? '[]', true)) ?> zones</small>
                        </td>
                        <td>
                            <?php if ($template['image_path']): ?>
                                <img src="<?= htmlspecialchars($template['image_path']) ?>"
                                    alt="<?= htmlspecialchars($template['name']) ?>"
                                    style="max-width: 150px; max-height: 80px; object-fit: contain;">
                            <?php else: ?>
                                <div class="placeholder-small">Pas d'image</div>
                            <?php endif; ?>
                        </td>
                        <td>
                            <input type="number"
                                name="count_<?= $template['id'] ?>"
                                class="form-control form-control-small"
                                value="0"
                                min="0"
                                max="1000"
                                placeholder="0">
                        </td>
                        <td>
                            <input type="text"
                                name="text_<?= $template['id'] ?>"
                                class="form-control"
                                placeholder="Texte pour toutes les zones">
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div class="form-actions-horizontal">
            <button type="button" onclick="fabricationManager.generateAll()" class="btn btn-success">
                Générer JSON
            </button>
            <button type="button" onclick="fabricationManager.downloadAll()" class="btn btn-success">
                Télécharger JSON
            </button>
        </div>
    </form>
</div>

<div id="jsonModal" class="modal" style="display:none;">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h3>JSON pour impression Python</h3>
            <button onclick="this.closest('.modal').style.display='none'" class="btn-close">×</button>
        </div>
        <pre id="jsonOutput"></pre>
        <div class="modal-footer">
            <button onclick="fabricationManager.copyJSON()" class="btn btn-primary">Copier</button>
            <button onclick="fabricationManager.downloadAll()" class="btn btn-success">Télécharger</button>
            <button onclick="this.closest('.modal').style.display='none'" class="btn">Fermer</button>
        </div>
    </div>
</div>

<script>
    const templatesData = <?= json_encode($templates) ?>;
    const BASE_PATH = '<?= BASE_PATH ?>';
</script>
<script src="<?= BASE_PATH ?>/public/js/fabrication.js"></script>

<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';
?>