# Installation de l'éditeur de templates de chèques

## Configuration Apache (.htaccess dans /public)

```apache
# public/.htaccess
RewriteEngine On

# Rediriger tout vers index.php sauf les fichiers existants
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Activer PHP
AddHandler application/x-httpd-php .php

# Sécurité
Options -Indexes
```

## Installation

### 1. Créer la base de données

```bash
mysql -u root -p
```

```sql
CREATE DATABASE cheque_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cheque_editor;

CREATE TABLE IF NOT EXISTS `templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `image_path` VARCHAR(255) DEFAULT NULL,
  `width` INT NOT NULL DEFAULT 210,
  `height` INT NOT NULL DEFAULT 99,
  `zones` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Données de test
INSERT INTO templates (name, width, height, zones) VALUES 
('Chèque Standard', 210, 99, '[]'),
('Chèque Bancaire', 175, 80, '[{"name":"Montant","left":120,"top":15,"right":165,"bottom":25,"font":"Arial","fontSize":14,"fontWeight":"bold"},{"name":"Date","left":140,"top":5,"right":170,"bottom":12,"font":"Arial","fontSize":10,"fontWeight":"normal"}]');
```

### 2. Configuration du projet

Éditer `config/database.php` avec vos paramètres MySQL:

```php
private $host = 'localhost';
private $db = 'cheque_editor';
private $user = 'root';
private $pass = 'votre_mot_de_passe';
```

### 3. Configuration Apache

Créer un VirtualHost ou pointer vers le dossier `public/`:

**Option 1: VirtualHost (recommandé)**

```apache
# /etc/apache2/sites-available/cheque-editor.conf
<VirtualHost *:80>
    ServerName cheque-editor.local
    DocumentRoot "/chemin/vers/cheque-editor/public"
    
    <Directory "/chemin/vers/cheque-editor/public">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "/var/log/apache2/cheque-editor-error.log"
    CustomLog "/var/log/apache2/cheque-editor-access.log" common
</VirtualHost>
```

Puis activer:
```bash
sudo a2ensite cheque-editor
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Ajouter à `/etc/hosts`:
```
127.0.0.1 cheque-editor.local
```

**Option 2: Sous-dossier Apache existant**

Si vous utilisez déjà Apache sur `localhost`, créez un lien symbolique:

```bash
ln -s /chemin/vers/cheque-editor/public /Library/WebServer/Documents/cheque-editor
```

Accès via: `http://localhost/cheque-editor`

### 4. Permissions

```bash
# Rendre le dossier uploads accessible en écriture
chmod 755 public/uploads
```

### 5. Tester l'installation

Ouvrir dans le navigateur:
- VirtualHost: `http://cheque-editor.local`
- Sous-dossier: `http://localhost/cheque-editor`

## Fonctionnalités

### Interface principale
- Liste de tous les templates
- Création de nouveaux templates avec upload d'image
- Suppression de templates

### Éditeur de zones
- Ajout de rectangles (zones d'impression)
- Sélection de zones au clic
- Déplacement à la souris
- Déplacement pixel par pixel avec les flèches (Shift+flèche = 5mm)
- Redimensionnement par les poignées top-left et bottom-right
- Double-clic pour renommer une zone
- Suppression avec Delete/Backspace

### Inspecteur
- Visualisation et édition des coordonnées en mm
- Modification des dimensions (largeur/hauteur)
- Propriétés de police (nom, taille)
- Mise à jour en temps réel

### Sauvegarde
- Sauvegarde AJAX sans rechargement
- Stockage JSON des zones dans MySQL

## Structure du JSON des zones

```json
[
  {
    "name": "Montant",
    "left": 120,
    "top": 15,
    "right": 165,
    "bottom": 25,
    "font": "Arial",
    "fontSize": 14,
    "fontWeight": "bold"
  },
  {
    "name": "Date",
    "left": 140,
    "top": 5,
    "right": 170,
    "bottom": 12,
    "font": "Arial",
    "fontSize": 10,
    "fontWeight": "normal"
  }
]
```

Toutes les dimensions sont en **millimètres**.

## Raccourcis clavier

- `Flèches` : Déplacer la zone sélectionnée de 1mm
- `Shift + Flèches` : Déplacer de 5mm
- `Delete` ou `Backspace` : Supprimer la zone sélectionnée
- `Double-clic` : Renommer la zone

## Prochaines étapes

Maintenant que la gestion des templates est fonctionnelle, vous pourrez ajouter:

1. **Module d'impression** : utiliser les zones définies pour imprimer sur les chèques
2. **Gestion des données** : formulaire pour saisir les données à imprimer
3. **Export PDF** : générer des PDFs avec les données positionnées
4. **Templates prédéfinis** : bibliothèque de modèles de chèques courants

## Dépannage

**Erreur "Page non trouvée"**
- Vérifier que mod_rewrite est activé: `sudo a2enmod rewrite`
- Vérifier les permissions sur .htaccess
- Vérifier le DocumentRoot dans la config Apache

**Erreur de connexion MySQL**
- Vérifier les identifiants dans `config/database.php`
- Vérifier que MySQL est démarré: `sudo systemctl status mysql`

**Upload d'images ne fonctionne pas**
- Vérifier les permissions: `chmod 755 public/uploads`
- Vérifier upload_max_filesize dans php.ini