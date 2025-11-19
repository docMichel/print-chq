<!DOCTYPE html>
<!-- 
// ========================================
// views/layout.php
// ========================================
-->
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? 'Éditeur de Templates' ?></title>
    <link rel="stylesheet" href="<?= BASE_PATH ?>/public/css/style.css">
</head>

<body>
    <header>
        <h1>Éditeur de Templates de Chèques</h1>
        <nav>
            <a href="<?= BASE_PATH ?>/">Liste des templates</a>
        </nav>
    </header>
    <main>
        <?php echo $content; ?>
    </main>
</body>

</html>