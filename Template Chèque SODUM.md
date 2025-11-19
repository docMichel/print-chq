# Guide d'Import - Template Chèque SODUM

## Étape 1 : Préparer le JSON

Le JSON complet est dans l'artefact "JSON des zones - Template Chèque SODUM".

### Option A : Via l'interface web

1. Aller sur `http://localhost/templates/`
2. Cliquer sur "+ Nouveau Template"
3. Nom : `Chèque SODUM`
4. Largeur : `202`
5. Hauteur : `74.25`
6. Upload image de fond (optionnel) : image du chèque vierge
7. Créer

Ensuite, dans l'éditeur :
- Ajouter chaque zone manuellement
- Positionner selon les coordonnées du JSON
- Sauvegarder

### Option B : Via SQL (plus rapide)

```sql
-- Se connecter à la base
mysql -u root -p cheque_editor

-- Insérer le template avec toutes les zones
INSERT INTO templates (name, width, height, zones, image_path) VALUES (
  'Chèque SODUM',
  202,
  74.25,
  '[
    {
      "name": "Talon - Numéro",
      "left": 4,
      "top": 61.45,
      "right": 38,
      "bottom": 71.45,
      "font": "Helvetica LT Extra Compressed",
      "fontSize": 10,
      "fontWeight": "normal",
      "default": "SODUM-210711-DUMMY-513312",
      "text": ""
    },
    {
      "name": "Talon - Montant",
      "left": 4,
      "top": 17.45,
      "right": 30,
      "bottom": 49.45,
      "font": "Helvetica LT Extra Compressed",
      "fontSize": 32,
      "fontWeight": "normal",
      "default": "1500F",
      "text": ""
    },
    {
      "name": "Talon - CFP",
      "left": 24.16,
      "top": 21.15,
      "right": 38,
      "bottom": 37.15,
      "font": "Helvetica LT Extra Compressed",
      "fontSize": 16,
      "fontWeight": "normal",
      "default": "CFP",
      "text": ""
    },
    {
      "name": "Talon - Montant lettres",
      "left": 4,
      "top": 28.78,
      "right": 38,
      "bottom": 33.78,
      "font": "Helvetica",
      "fontSize": 5,
      "fontWeight": "normal",
      "default": "mille cinq cents CFP",
      "text": ""
    },
    {
      "name": "Talon - Validité",
      "left": 4,
      "top": 31.28,
      "right": 38,
      "bottom": 38.78,
      "font": "Helvetica",
      "fontSize": 7.5,
      "fontWeight": "normal",
      "default": "Validité :02/02/21",
      "text": ""
    },
    {
      "name": "Corps - Numéro CMC7",
      "left": 142,
      "top": 61.75,
      "right": 202,
      "bottom": 70.75,
      "font": "Cmc7",
      "fontSize": 8,
      "fontWeight": "bold",
      "default": "72340-513313-DUMMY-513312",
      "text": ""
    },
    {
      "name": "Corps - Code-barre",
      "left": 166,
      "top": 65.45,
      "right": 206,
      "bottom": 71.45,
      "font": "BARCODE",
      "fontSize": 24,
      "fontWeight": "normal",
      "default": "72340-513313",
      "text": ""
    },
    {
      "name": "Corps - Montant",
      "left": 167,
      "top": 2.45,
      "right": 197,
      "bottom": 34.45,
      "font": "Helvetica LT Extra Compressed",
      "fontSize": 32,
      "fontWeight": "normal",
      "default": "1500F",
      "text": ""
    },
    {
      "name": "Corps - CFP",
      "left": 187.16,
      "top": 6.15,
      "right": 202,
      "bottom": 22.15,
      "font": "Helvetica LT Extra Compressed",
      "fontSize": 16,
      "fontWeight": "normal",
      "default": "CFP",
      "text": ""
    },
    {
      "name": "Corps - Montant lettres",
      "left": 167,
      "top": 13.78,
      "right": 202,
      "bottom": 18.78,
      "font": "Helvetica",
      "fontSize": 5,
      "fontWeight": "normal",
      "default": "mille cinq cents CFP",
      "text": ""
    },
    {
      "name": "Corps - Validité",
      "left": 167,
      "top": 19.95,
      "right": 202,
      "bottom": 27.45,
      "font": "Helvetica",
      "fontSize": 7.5,
      "fontWeight": "normal",
      "default": "Validité :02/02/21",
      "text": ""
    },
    {
      "name": "Corps - Texte libre",
      "left": 41,
      "top": 61.45,
      "right": 150,
      "bottom": 70.45,
      "font": "Comic Sans MS",
      "fontSize": 9,
      "fontWeight": "normal",
      "default": "Joyeux Noël !",
      "text": ""
    }
  ]',
  NULL
);
```

**Note** : Le JSON doit être sur une seule ligne pour SQL, ou échappé correctement.

## Étape 2 : Vérifier l'import

```sql
-- Récupérer l'ID du template
SELECT id, name, width, height FROM templates WHERE name = 'Chèque SODUM';

-- Vérifier les zones
SELECT id, name, JSON_LENGTH(zones) as nb_zones FROM templates WHERE name = 'Chèque SODUM';
-- Devrait retourner 12 zones
```

## Étape 3 : Visualiser dans l'éditeur

1. Aller sur `http://localhost/templates/`
2. Trouver "Chèque SODUM"
3. Cliquer sur "Éditer"
4. Toutes les zones devraient s'afficher sur le canvas

## Étape 4 : Ajuster si nécessaire

Dans l'éditeur :
- Vérifier que toutes les zones sont bien placées
- Ajuster les positions si besoin (drag & drop)
- Modifier les polices (menu déroulant)
- Tester avec texte par défaut
- Sauvegarder

## Étape 5 : Utiliser pour fabrication

1. Aller dans "Fabrication"
2. Ligne "Chèque SODUM" :
   - Nombre : `10`
   - Texte : (vide ou texte commun pour toutes les zones)
3. Cliquer "Générer JSON" ou "Télécharger JSON"

Le JSON généré contiendra :
```json
{
  "generated_at": "2025-11-19 ...",
  "templates": [
    {
      "template_name": "Chèque SODUM",
      "width": 202,
      "height": 74.25,
      "count": 10,
      "zones": [
        {
          "name": "Talon - Numéro",
          "left": 4,
          "top": 61.45,
          "right": 38,
          "bottom": 71.45,
          "font": "Helvetica LT Extra Compressed",
          "fontSize": 10,
          "text": "SODUM-210711-00001-513312"
        },
        // ... toutes les autres zones avec leur texte
      ]
    }
  ]
}
```

## Étape 6 : Script Python pour impression

```python
import json
from PIL import Image, ImageDraw, ImageFont
from barcode import Code128
from barcode.writer import ImageWriter

def print_cheques_sodum(json_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for template in data['templates']:
        if template['template_name'] != 'Chèque SODUM':
            continue
            
        # Dimensions en mm -> pixels
        mm_to_px = 96 / 25.4
        width_px = int(template['width'] * mm_to_px)
        height_px = int(template['height'] * mm_to_px)
        
        for i in range(template['count']):
            # Créer image vierge ou charger fond
            if template['image_path']:
                img = Image.open(template['image_path'])
            else:
                img = Image.new('RGB', (width_px, height_px), 'white')
            
            draw = ImageDraw.Draw(img)
            
            # Dessiner chaque zone
            for zone in template['zones']:
                left = int(zone['left'] * mm_to_px)
                top = int(zone['top'] * mm_to_px)
                
                # Cas spécial : BARCODE
                if zone['font'] == 'BARCODE':
                    # Générer code-barre C128
                    barcode = Code128(zone['text'], writer=ImageWriter())
                    barcode_img = barcode.render()
                    # Redimensionner et coller
                    width = int((zone['right'] - zone['left']) * mm_to_px)
                    height = int((zone['bottom'] - zone['top']) * mm_to_px)
                    barcode_img = barcode_img.resize((width, height))
                    img.paste(barcode_img, (left, top))
                    continue
                
                # Charger la police
                font_name = zone['font']
                if font_name == 'Cmc7':
                    font_path = 'fonts/Cmc7.ttf'
                elif font_name == 'Helvetica LT Extra Compressed':
                    font_path = 'fonts/Helvetica/Helvetica Ultra Compressed/Helvetica Ultra Compressed.otf'
                elif font_name == 'Helvetica':
                    font_path = 'fonts/Helvetica/Helvetica Roman/Helvetica Roman.ttf'
                elif font_name == 'Comic Sans MS':
                    font_path = 'fonts/Comic Sans MS.ttf'
                else:
                    # Police par défaut
                    font_path = 'fonts/Helvetica/Helvetica Roman/Helvetica Roman.ttf'
                
                try:
                    font = ImageFont.truetype(font_path, zone['fontSize'])
                except:
                    font = ImageFont.load_default()
                
                # Dessiner le texte
                draw.text((left + 5, top + 5), zone['text'], font=font, fill='black')
            
            # Sauvegarder
            img.save(f"cheque_sodum_{i+1:04d}.png")
            print(f"✓ Chèque {i+1}/{template['count']} généré")

# Utilisation
print_cheques_sodum('cheques_batch_123456.json')
```

## Notes importantes

### Polices requises
Assure-toi d'avoir dans `/fonts` :
- `Cmc7.ttf` (police bancaire CMC7)
- `Comic Sans MS.ttf`
- `Helvetica/` avec les variantes
  - Helvetica Ultra Compressed
  - Helvetica Roman

### Code-barre
Pour générer les codes-barres C128 en Python :
```bash
pip install python-barcode pillow
```

### Personnalisation
Pour chaque chèque avec des données différentes, tu peux :
1. Charger un CSV avec les données
2. Remplacer `zone['text']` par les valeurs du CSV
3. Générer un chèque par ligne

### Image de fond
Si tu as une image du chèque vierge :
1. Scanner à 300 DPI
2. Redimensionner à 202mm × 74.25mm
3. Upload dans le template
4. Les zones s'afficheront par-dessus