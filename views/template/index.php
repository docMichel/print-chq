<?php
$title = 'Liste des Templates';
ob_start();
?>

<div class="container">
    <div class="header-actions">
        <h2>Templates disponibles</h2>
        <div style="display: flex; gap: 0.5rem;">
            <a href="<?= BASE_PATH ?>/check" class="btn btn-success">Fabrication</a>
            <button onclick="document.getElementById('createForm').style.display='block'" class="btn btn-primary">
                + Nouveau Template
            </button>
        </div>
    </div>

    <div id="createForm" style="display:none;" class="modal">
        <div class="modal-content">
            <h3>Créer un nouveau template</h3>
            <form action="<?= BASE_PATH ?>/template/create" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Nom:</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Largeur (mm):</label>
                    <input type="number" name="width" value="210">
                </div>
                <div class="form-group">
                    <label>Hauteur (mm):</label>
                    <input type="number" name="height" value="99">
                </div>
                <div class="form-group">
                    <label>Image de fond (optionnel):</label>
                    <input type="file" name="image" accept="image/*">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Créer</button>
                    <button type="button" onclick="this.closest('.modal').style.display='none'" class="btn">Annuler</button>
                </div>
            </form>
        </div>
    </div>

    <div class="template-grid">
        <?php foreach ($templates as $template): ?>
            <div class="template-card">
                <div class="template-preview">
                    <?php if ($template['image_path']): ?>
                        <img src="<?= htmlspecialchars($template['image_path']) ?>" alt="<?= htmlspecialchars($template['name']) ?>">
                    <?php else: ?>
                        <div class="placeholder">Pas d'image</div>
                    <?php endif; ?>
                </div>
                <div class="template-info">
                    <h3><?= htmlspecialchars($template['name']) ?></h3>
                    <p><?= $template['width'] ?> × <?= $template['height'] ?> mm</p>
                    <p><?= count(json_decode($template['zones'] ?? '[]', true)) ?> zones</p>
                </div>
                <div class="template-actions">
                    <a href="<?= BASE_PATH ?>/template/edit/<?= $template['id'] ?>" class="btn btn-primary">Éditer</a>
                    <a href="<?= BASE_PATH ?>/template/delete/<?= $template['id'] ?>"
                        onclick="return confirm('Supprimer ce template ?')"
                        class="btn btn-danger">Supprimer</a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';
?>