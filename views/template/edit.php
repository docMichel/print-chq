<?php
$title = 'Éditer Template - ' . htmlspecialchars($template['name']);
ob_start();
?>

<div class="editor-container">
    <div class="editor-sidebar">
        <h3><?= htmlspecialchars($template['name']) ?></h3>

        <div class="zone-controls">
            <button onclick="editor.addZone()" class="btn btn-primary">+ Ajouter une zone</button>
            <button onclick="editor.deleteSelected()" class="btn btn-danger">Supprimer zone</button>
        </div>

        <div id="inspector" class="inspector">
            <h4>Inspecteur</h4>
            <div id="inspectorContent">
                <p>Sélectionnez une zone</p>
            </div>
        </div>

        <div class="zone-list">
            <h4>Zones</h4>
            <ul id="zoneList"></ul>
        </div>

        <div class="editor-actions">
            <button onclick="editor.save()" class="btn btn-success">Sauvegarder</button>
            <button onclick="editor.cancel()" class="btn">Annuler</button>
        </div>
    </div>

    <div class="editor-canvas-container">
        <canvas id="editorCanvas"></canvas>
    </div>
</div>

<script>
    const templateData = <?= json_encode($template) ?>;
    const BASE_PATH = '<?= BASE_PATH ?>';
</script>
<!-- Charger le module principal -->
<script type="module" src="<?= BASE_PATH ?>/public/js/editor.js"></script>

<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';
?>