# Installation du Module Fabrication de Chèques

## Fichiers à créer

### 1. Contrôleur
Créer `controllers/CheckController.php` (code fourni dans l'artifact précédent)

### 2. Vue
Créer `views/check/index.php` - Page unique de fabrication avec tableau

### 3. JavaScript
Créer `public/js/fabrication.js` (code fourni)

### 4. Mise à jour de routes.php

Ajouter ces routes **avant** la section 404 dans `routes.php` :

```php
<?php
// Routes pour la fabrication de chèques
if ($uri === '/check' || $uri === '/check/index') {
    require_once __DIR__ . '/controllers/CheckController.php';
    $controller = new CheckController();
    $controller->index();
    return;
}

if ($uri === '/check/generate' && $method === 'POST') {
    require_once __DIR__ . '/controllers/CheckController.php';
    $controller = new CheckController();
    $controller->generateBatch();
    return;
}
```

### 5. Mise à jour du CSS

Ajouter le CSS fourni à la fin de `public/css/style.css`

### 6. Bouton Fabrication ajouté

Le bouton "Fabrication" a été ajouté sur la page d'accueil.

## Format du JSON généré

Le JSON généré contient plusieurs templates :

```json
{
  "generated_at": "2025-11-19 14:30:00",
  "templates": [
    {
      "template_name": "Chèque Standard",
      "template_id": 1,
      "image_path": "/uploads/cheque.jpg",
      "width": 210,
      "height": 99,
      "count": 10,
      "zones": [
        {
          "name": "Montant",
          "left": 120,
          "top": 15,
          "right": 165,
          "bottom": 25,
          "font": "Arial",
          "fontSize": 14,
          "fontWeight": "bold",
          "default": "",
          "text": "1 234,56 €"
        }
      ]
    },
    {
      "template_name": "Chèque Bancaire",
      "template_id": 2,
      "image_path": "/uploads/cheque2.jpg",
      "width": 175,
      "height": 80,
      "count": 5,
      "zones": [...]
    }
  ]
}
```

## Workflow d'utilisation

1. **Navigation** : Cliquer sur "Fabrication" (bouton vert) sur la page d'accueil
2. **Configuration en masse** :
   - Un tableau affiche tous les templates
   - Pour chaque template : entrer le nombre de chèques et le texte
3. **Génération** :
   - "Générer JSON" : Affiche le JSON dans une modal
   - "Télécharger JSON" : Télécharge directement le fichier
   - Le JSON contient uniquement les templates avec nombre > 0

## Caractéristiques

✅ **Multi-template** : Générer plusieurs types de chèques en une seule fois
✅ **Texte unique** : Un seul champ texte appliqué à toutes les zones du template
✅ **Filtrage automatique** : Seuls les templates avec nombre > 0 sont inclus
✅ **Interface simple** : Tableau clair avec aperçu de chaque template

## Script Python (exemple de traitement)

```python
import json
from PIL import Image, ImageDraw, ImageFont

def print_checks_batch(json_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Génération créée le: {data['generated_at']}")
    
    # Pour chaque template
    for template in data['templates']:
        print(f"\n=== {template['template_name']} ===")
        
        # Charger l'image template
        template_img = Image.open(template['image_path'])
        
        # Générer les chèques
        for i in range(template['count']):
            check = template_img.copy()
            draw = ImageDraw.Draw(check)
            
            # Dessiner chaque zone
            for zone in template['zones']:
                mm_to_px = 96 / 25.4
                left = int(zone['left'] * mm_to_px)
                top = int(zone['top'] * mm_to_px)
                
                try:
                    font = ImageFont.truetype(zone['font'], zone['fontSize'])
                except:
                    font = ImageFont.load_default()
                
                draw.text((left + 5, top + 5), zone['text'], 
                         font=font, fill='black')
            
            # Sauvegarder
            filename = f"{template['template_name']}_{i+1}.png"
            check.save(filename)
            print(f"  ✓ Chèque {i+1}/{template['count']}")

# Utilisation
print_checks_batch('cheques_batch_123456.json')
```

## Améliorations possibles

1. **Texte par zone** : Permettre un texte différent pour chaque zone
2. **Import CSV** : Générer plusieurs chèques avec données différentes
3. **Aperçu** : Preview du premier chèque de chaque template
4. **Présets** : Sauvegarder des configurations de fabrication
5. **Validation** : Vérifier que les templates ont des zones définies

## Dépannage

**"Aucun template sélectionné"**
- Vérifier que le champ "Nombre" contient une valeur > 0

**JSON vide**
- S'assurer qu'au moins un template a un nombre > 0
- Vérifier que les zones sont définies dans l'éditeur

**Champs non sauvegardés**
- Le formulaire n'est pas soumis, c'est normal
- JavaScript collecte les données directement depuis les inputs# Installation du Module Fabrication de Chèques

## Fichiers à créer

### 1. Contrôleur
Créer `controllers/CheckController.php` (code fourni dans l'artifact précédent)

### 2. Vues
Créer ces fichiers :
- `views/check/index.php` - Liste des templates pour fabrication
- `views/check/create.php` - Formulaire de création de chèques

### 3. JavaScript
Créer `public/js/check-creator.js` (code fourni)

### 4. Mise à jour de routes.php

Ajouter ces routes **avant** la section 404 dans `routes.php` :

```php
<?php
// Routes pour la fabrication de chèques
if ($uri === '/check' || $uri === '/check/index') {
    require_once __DIR__ . '/controllers/CheckController.php';
    $controller = new CheckController();
    $controller->index();
    return;
}

if (preg_match('#^/check/create/(\d+)$#', $uri, $matches)) {
    require_once __DIR__ . '/controllers/CheckController.php';
    $controller = new CheckController();
    $controller->create($matches[1]);
    return;
}

if ($uri === '/check/generate' && $method === 'POST') {
    require_once __DIR__ . '/controllers/CheckController.php';
    $controller = new CheckController();
    $controller->generate();
    return;
}
```

### 5. Mise à jour du CSS

Ajouter le CSS fourni à la fin de `public/css/style.css`

### 6. Mise à jour du layout

Le layout a été mis à jour avec les liens de navigation.

## Format du JSON généré

```json
{
  "template_name": "Chèque Standard",
  "template_id": 1,
  "image_path": "/uploads/cheque.jpg",
  "width": 210,
  "height": 99,
  "count": 10,
  "zones": [
    {
      "name": "Montant",
      "left": 120,
      "top": 15,
      "right": 165,
      "bottom": 25,
      "font": "Arial",
      "fontSize": 14,
      "fontWeight": "bold",
      "default": "1 234,56 €",
      "text": "1 234,56 €"
    },
    {
      "name": "Date",
      "left": 140,
      "top": 5,
      "right": 170,
      "bottom": 12,
      "font": "Arial",
      "fontSize": 10,
      "fontWeight": "normal",
      "default": "19/11/2025",
      "text": "19/11/2025"
    }
  ]
}
```

## Workflow d'utilisation

1. **Navigation** : Cliquer sur "Fabrication" dans le menu
2. **Sélection** : Choisir un template et cliquer sur "Créer des chèques"
3. **Configuration** :
   - Définir le nombre de chèques (1-1000)
   - Remplir les zones avec le texte désiré
4. **Prévisualisation** : Cliquer sur "Prévisualiser" pour voir le rendu
5. **Génération** :
   - "Générer JSON" : Affiche le JSON dans une modal
   - "Télécharger JSON" : Télécharge directement le fichier
   - "Copier" : Copie le JSON dans le presse-papier

## Script Python (exemple de traitement)

```python
import json
from PIL import Image, ImageDraw, ImageFont

def print_checks(json_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Charger l'image template
    template_img = Image.open(data['image_path'])
    
    # Pour chaque chèque
    for i in range(data['count']):
        # Copier le template
        check = template_img.copy()
        draw = ImageDraw.Draw(check)
        
        # Dessiner chaque zone
        for zone in data['zones']:
            # Convertir mm en pixels (96 DPI)
            mm_to_px = 96 / 25.4
            left = int(zone['left'] * mm_to_px)
            top = int(zone['top'] * mm_to_px)
            
            # Charger la police
            try:
                font = ImageFont.truetype(zone['font'], zone['fontSize'])
            except:
                font = ImageFont.load_default()
            
            # Dessiner le texte
            draw.text((left + 5, top + 5), zone['text'], 
                     font=font, fill='black')
        
        # Sauvegarder
        check.save(f"cheque_{i+1}.png")
        print(f"Chèque {i+1}/{data['count']} généré")

# Utilisation
print_checks('cheques_Standard_123456.json')
```

## Améliorations possibles

1. **Données multiples** : Importer un CSV pour générer plusieurs chèques différents
2. **Numérotation automatique** : Incrémenter un numéro de chèque
3. **Variables dynamiques** : Date du jour, compteur, etc.
4. **Aperçu multiple** : Voir plusieurs chèques d'un coup
5. **Historique** : Sauvegarder les générations précédentes
6. **Export PDF** : Générer directement un PDF multi-pages

## Dépannage

**BASE_PATH non défini dans JS**
- Vérifier que `define('BASE_PATH', ...)` est bien dans `index.php`
- Le BASE_PATH doit être injecté dans le HTML

**JSON vide**
- Vérifier que les zones ont été définies dans l'éditeur de template
- S'assurer que les champs sont remplis dans le formulaire

**Police non trouvée**
- Vérifier que la police existe sur le système où tourne Python
- Utiliser des polices standard comme fallback