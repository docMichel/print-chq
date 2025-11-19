#!/usr/bin/env python3
import json
import sys
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import black, red, blue
from reportlab.graphics.barcode import code128
from reportlab.graphics import renderPDF

# Dossier fonts
FONTS_DIR = './fonts'

# Cache des fonts disponibles
_available_fonts = {}
_registered_fonts = set()
DEBUG_MODE = False

def normalize_font_name(name):
    """Normalise un nom de font pour le matching"""
    return name.lower().replace(' ', '').replace('-', '').replace('_', '')

def scan_fonts_directory():
    """Scan le dossier fonts et indexe tous les fichiers TTF/OTF"""
    global _available_fonts
    
    if _available_fonts:  # Déjà scanné
        return
    
    print(f"🔍 Scan du dossier fonts: {FONTS_DIR}")
    
    for root, dirs, files in os.walk(FONTS_DIR):
        for file in files:
            if file.lower().endswith(('.ttf', '.otf')):
                full_path = os.path.join(root, file)
                # Nom sans extension
                font_name = os.path.splitext(file)[0]
                normalized = normalize_font_name(font_name)
                _available_fonts[normalized] = full_path
                
    print(f"✓ {len(_available_fonts)} fonts trouvées\n")

def find_font_file(font_name):
    """Trouve le fichier de font le plus proche"""
    normalized = normalize_font_name(font_name)
    
    # Match exact
    if normalized in _available_fonts:
        return _available_fonts[normalized]
    
    # Match partiel (cherche si le nom demandé est contenu dans une font)
    for key, path in _available_fonts.items():
        if normalized in key or key in normalized:
            return path
    
    return None

def mm_to_points(mm):
    """Convertit millimètres en points"""
    return mm * 2.834645669

def debug_print(msg):
    """Affiche uniquement en mode debug"""
    if DEBUG_MODE:
        print(f"  🔍 {msg}")

def register_font(font_name):
    """Enregistre une font TTF/OTF"""
    if font_name in _registered_fonts:
        return True
    
    # Fonts core ReportLab (toujours disponibles)
    core_fonts = ['helvetica', 'helvetica-bold', 'helvetica-oblique', 
                  'times-roman', 'times-bold', 'courier', 'courier-bold']
    
    normalized_input = normalize_font_name(font_name)
    
    # Check si c'est une font core
    for core in core_fonts:
        if normalize_font_name(core) == normalized_input:
            _registered_fonts.add(font_name)
            debug_print(f"Font core: {core}")
            return True
    
    # Cherche le fichier
    font_file = find_font_file(font_name)
    
    if not font_file:
        return False
    
    try:
        # Nom unique pour ReportLab
        register_name = font_name.lower().replace(' ', '-')
        pdfmetrics.registerFont(TTFont(register_name, font_file))
        _registered_fonts.add(font_name)
        print(f"✓ Font: {font_name} → {os.path.basename(font_file)}")
        return True
    except Exception as e:
        print(f"✗ Erreur {font_name}: {e}")
        return False

def get_font_name(font, font_weight):
    """Retourne le nom de la police + gestion Bold"""
    # Normalise le nom
    font_clean = font.strip()
    
    # Gestion du Bold
    if font_weight == 'bold':
        # Essaie d'abord la version Bold
        bold_variants = [
            f"{font_clean}-bold",
            f"{font_clean} bold",
            f"{font_clean}bold",
        ]
        
        for variant in bold_variants:
            if register_font(variant):
                debug_print(f"Font: {variant}")
                return variant.lower().replace(' ', '-')
        
        # Si pas de Bold, utilise la version normale
        print(f"⚠️  Pas de Bold pour '{font_clean}', version normale utilisée")
    
    # Version normale
    if register_font(font_clean):
        debug_print(f"Font: {font_clean}")
        return font_clean.lower().replace(' ', '-')
    
    # Fallback Helvetica
    print(f"⚠️  Font '{font_clean}' introuvable, fallback Helvetica")
    fallback = 'Helvetica-Bold' if font_weight == 'bold' else 'Helvetica'
    return fallback

def get_zone_text(zone):
    """Récupère le texte à afficher : text ou default si text est vide"""
    text = zone.get('text', '').strip()
    if text:
        return text
    return zone.get('default', '').strip()

def draw_zone_debug(c, left, top, right, bottom, color=blue):
    """Contour debug"""
    if not DEBUG_MODE:
        return
    
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(0.5)
    c.setDash(1, 2)
    c.rect(left, bottom, right - left, top - bottom, stroke=1, fill=0)
    c.restoreState()

def draw_clipped_text(c, text, left, top, right, bottom, font_name, font_size):
    """Texte avec clipping"""
    c.saveState()
    
    path = c.beginPath()
    path.rect(left, bottom, right - left, top - bottom)
    c.clipPath(path, stroke=0)
    
    try:
        c.setFont(font_name, font_size)
    except KeyError:
        c.setFont('Helvetica', font_size)
    
    text_y = top - font_size
    c.drawString(left, text_y, str(text))
    
    c.restoreState()

def draw_barcode(c, code, left, top, right, bottom, bar_width=0.3, show_text=False):
    """Dessine un code-barres C128"""
    if not code:
        debug_print("Barcode vide, ignoré")
        return
    
    width = right - left
    height = top - bottom
    
    bar_width_points = mm_to_points(bar_width)
    
    debug_print(f"Barcode C128: '{code}' | zone: {width:.1f}x{height:.1f}pt")
    
    try:
        barcode = code128.Code128(
            str(code),
            barHeight=height * 0.8,
            barWidth=bar_width_points,
            humanReadable=show_text
        )
        
        barcode_width = barcode.width
        x_pos = left + (width - barcode_width) / 2
        y_pos = bottom + (height * 0.1)
        
        barcode.drawOn(c, x_pos, y_pos)
        
        if DEBUG_MODE:
            draw_zone_debug(c, left, top, right, bottom, red)
            
    except Exception as e:
        print(f"✗ Erreur barcode '{code}': {e}")
        c.saveState()
        c.setFont('Helvetica', 8)
        c.drawString(left + 5, bottom + 5, f"BARCODE ERROR: {code}")
        c.restoreState()

def draw_cheque(c, template, y_offset=0):
    """Dessine un chèque"""
    width = mm_to_points(template['width'])
    height = mm_to_points(template['height'])
    
    debug_print(f"Chèque: {template['template_name']} | {template['width']}x{template['height']}mm")
    
    # Image de fond
    if template.get('image_path') and os.path.exists(template['image_path']):
        debug_print(f"Image: {template['image_path']}")
        c.drawImage(template['image_path'], 0, y_offset, 
                   width=width, height=height, preserveAspectRatio=True)
    
    # Contour du chèque en debug
    if DEBUG_MODE:
        c.saveState()
        c.setStrokeColor(red)
        c.setLineWidth(1)
        c.rect(0, y_offset, width, height, stroke=1, fill=0)
        c.setFont('Helvetica', 8)
        c.drawString(5, y_offset + height - 10, 
                    f"{template['template_name']} ({template['width']}x{template['height']}mm)")
        c.restoreState()
    
    # Zones
    zones = template.get('zones', [])
    debug_print(f"Zones: {len(zones)}")
    
    for i, zone in enumerate(zones):
        zone_font = zone.get('font', 'Helvetica')
        zone_name = zone.get('name', 'sans nom')
        
        left = mm_to_points(zone['left'])
        right = mm_to_points(zone.get('right', zone['left'] + 50))
        top_mm = zone['top']
        bottom_mm = zone.get('bottom', zone['top'] + 10)
        
        top = height - mm_to_points(top_mm)
        bottom = height - mm_to_points(bottom_mm)
        
        display_text = get_zone_text(zone)
        
        # BARCODE ?
        if zone_font.upper() == 'BARCODE':
            debug_print(f"  Zone {i+1}: BARCODE '{zone_name}' → '{display_text}'")
            draw_barcode(c, display_text, 
                        left, top + y_offset, right, bottom + y_offset,
                        bar_width=0.3, show_text=False)
        else:
            # Texte
            debug_print(f"  Zone {i+1}: TEXTE '{zone_name}' → '{display_text}'")
            
            font_name = get_font_name(zone_font, zone.get('fontWeight', 'normal'))
            font_size = zone.get('fontSize', 12)
            
            draw_zone_debug(c, left, top + y_offset, right, bottom + y_offset)
            draw_clipped_text(c, display_text, left, top + y_offset, right, bottom + y_offset, 
                             font_name, font_size)
    
    return height

def generate_cheques_pdf(json_data, output_path):
    """Génère le PDF"""
    data = json.loads(json_data)
    
    print(f"\n{'='*60}")
    print(f"Génération PDF: {output_path}")
    print(f"{'='*60}")
    
    # Scan fonts AVANT de commencer
    scan_fonts_directory()
    
    c = canvas.Canvas(output_path, pagesize=A4)
    page_width, page_height = A4
    
    print(f"Format A4: {page_width:.1f}x{page_height:.1f} points")
    print(f"Templates: {len(data['templates'])}\n")
    
    current_y = page_height
    page_num = 1
    cheque_count = 0
    
    for template_idx, template in enumerate(data['templates']):
        count = template.get('count', 1)
        zones_count = len(template.get('zones', []))
        print(f"Template {template_idx+1}: '{template['template_name']}' → {count}x ({zones_count} zones)")
        
        for i in range(count):
            cheque_height = mm_to_points(template['height'])
            spacing = mm_to_points(5)
            
            if current_y - cheque_height < 0:
                page_num += 1
                print(f"\n📄 Page {page_num}")
                c.showPage()
                current_y = page_height
            
            current_y -= cheque_height
            draw_cheque(c, template, current_y)
            cheque_count += 1
            current_y -= spacing
    
    c.save()
    print(f"\n{'='*60}")
    print(f"✓ PDF généré: {output_path}")
    print(f"  {cheque_count} chèques sur {page_num} page(s)")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python generate_cheques.py <input.json> [output.pdf] [--debug]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = 'cheques.pdf'
    
    for arg in sys.argv[2:]:
        if arg == '--debug':
            DEBUG_MODE = True
        elif not arg.startswith('--'):
            output_file = arg
    
    with open(input_file, 'r', encoding='utf-8') as f:
        json_data = f.read()
    
    generate_cheques_pdf(json_data, output_file)