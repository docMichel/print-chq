// public/js/editor/TemplateEditor.js

import { FontManager } from './FontManager.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { MouseHandler } from './MouseHandler.js';
import { InspectorUI } from './InspectorUI.js';

export class TemplateEditor {
    constructor(templateData, basePath) {
        this.template = templateData;
        this.basePath = basePath;
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.zones = JSON.parse(templateData.zones || '[]');
        this.selectedZone = null;

        // Initialiser les modules
        this.fontManager = new FontManager();
        this.renderer = new CanvasRenderer(this);
        this.mouseHandler = new MouseHandler(this);
        this.inspector = new InspectorUI(this);

        // Charger et initialiser
        this.init();
    }

    async init() {
        // Charger les polices
        await this.fontManager.loadFromAPI(this.basePath);

        // Configuration du canvas
        const mmToPixel = 96 / 25.4;
        this.canvas.width = Math.round(this.template.width * mmToPixel);
        this.canvas.height = Math.round(this.template.height * mmToPixel);

        // Normaliser les zones
        this.zones = this.zones.map(zone => ({
            name: zone.name || '',
            left: zone.left || 0,
            top: zone.top || 0,
            right: zone.right || 50,
            bottom: zone.bottom || 20,
            font: zone.font || 'Arial',
            fontSize: zone.fontSize || 12,
            fontWeight: zone.fontWeight || 'normal',
            default: zone.default || ''
        }));

        // Charger l'image de fond
        if (this.template.image_path) {
            this.renderer.loadBackgroundImage(this.template.image_path);
        }

        // Rendu initial
        this.renderer.render();
        this.inspector.updateZoneList();

        console.log(`✓ Éditeur initialisé`);
    }

    addZone() {
        const newZone = {
            name: `Zone ${this.zones.length + 1}`,
            left: 10,
            top: 10,
            right: 60,
            bottom: 30,
            font: 'Arial',
            fontSize: 12,
            fontWeight: 'normal',
            default: ''
        };

        this.zones.push(newZone);
        this.selectedZone = this.zones.length - 1;
        this.renderer.render();
        this.inspector.update();
        this.inspector.updateZoneList();
    }

    deleteSelected() {
        if (this.selectedZone !== null && confirm('Supprimer cette zone ?')) {
            this.zones.splice(this.selectedZone, 1);
            this.selectedZone = null;
            this.renderer.render();
            this.inspector.update();
            this.inspector.updateZoneList();
        }
    }

    selectZone(index) {
        this.selectedZone = index;
        this.renderer.render();
        this.inspector.update();
        this.inspector.updateZoneList();
    }

    showCustomFont() {
        const field = document.getElementById('customFontField');
        const input = document.getElementById('zoneCustomFont');

        if (field.style.display === 'none') {
            field.style.display = 'grid';
            input.focus();

            input.onchange = (e) => {
                const customFont = e.target.value.trim();
                if (customFont) {
                    this.zones[this.selectedZone].font = customFont;
                    this.fontManager.addCustomFont(customFont);
                    this.renderer.render();
                    this.inspector.update();
                }
            };
        } else {
            field.style.display = 'none';
        }
    }

    async save() {
        try {
            const response = await fetch(this.basePath + '/template/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: this.template.id,
                    zones: this.zones
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Template sauvegardé avec succès !');
            } else {
                alert('Erreur lors de la sauvegarde: ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            alert('Erreur lors de la sauvegarde: ' + error.message);
        }
    }

    cancel() {
        if (confirm('Annuler les modifications ?')) {
            window.location.href = this.basePath + '/';
        }
    }
}