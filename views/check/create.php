<?php
// ========================================
// views/check/create.php
// ========================================

$title = 'Créer des chèques - ' . htmlspecialchars($template['name']);
ob_start();
?>

<div class="check-creator-container">
    <div class="check-creator-sidebar">
        <h3><?= htmlspecialchars($template['name']) ?></h3>

        <div class="form-section">
            <label>Nombre de chèques:</label>
            <input type="number" id="checkCount" value="1" min="1" max="1000" class="form-control">
        </div>

        <div class="form-section">
            <h4>Remplir les zones</h4>
            <div id="zonesForm"></div>
        </div>

        <div class="form-actions-vertical">
            <button onclick="checkCreator.preview()" class="btn btn-primary">Prévisualiser</button>
            <button onclick="checkCreator.generateJSON()" class="btn btn-success">Générer JSON</button>
            <button onclick="checkCreator.downloadJSON()" class="btn btn-success">Télécharger JSON</button>
            <a href="<?= BASE_PATH ?>/check" class="btn">Annuler</a>
        </div>
    </div>

    <div class="check-creator-canvas-container">
        <div class="preview-header">
            <h4>Prévisualisation</h4>
            <span id="previewInfo">Aperçu du chèque</span>
        </div>
        <canvas id="checkCanvas"></canvas>
    </div>
</div>

<div id="jsonModal" class="modal" style="display:none;">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h3>JSON pour impression Python</h3>
            <button onclick="this.closest('.modal').style.display='none'" class="btn-close">×</button>
        </div>
        <pre id="jsonOutput"></pre>
        <div class="modal-footer">
            <button onclick="checkCreator.copyJSON()" class="btn btn-primary">Copier</button>
            <button onclick="checkCreator.downloadJSON()" class="btn btn-success">Télécharger</button>
            <button onclick="this.closest('.modal').style.display='none'" class="btn">Fermer</button>
        </div>
    </div>
</div>

<script>
    const templateData = <?= json_encode($template) ?>;
    const BASE_PATH = '<?= BASE_PATH ?>';
</script>
<script src="<?= BASE_PATH ?>/public/js/check-creator.js"></script>

<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';
?>