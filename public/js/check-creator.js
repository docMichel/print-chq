
// ========================================
// public/js/check-creator.js
// ========================================
class CheckCreator {
    constructor(templateData) {
        this.template = templateData;
        this.canvas = document.getElementById('checkCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.zones = JSON.parse(templateData.zones || '[]');
        this.backgroundImage = null;
        this.generatedJSON = null;

        // Conversion mm vers pixels (96 DPI)
        this.mmToPixel = 96 / 25.4;

        // Taille du canvas en pixels
        this.canvasWidth = Math.round(this.template.width * this.mmToPixel);
        this.canvasHeight = Math.round(this.template.height * this.mmToPixel);

        this.init();
    }

    init() {
        // Configuration du canvas
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        // Charger l'image de fond si présente
        if (this.template.image_path) {
            this.backgroundImage = new Image();
            this.backgroundImage.onload = () => this.renderPreview();
            this.backgroundImage.src = this.template.image_path;
        }

        // Créer le formulaire des zones
        this.createZonesForm();

        // Initialisation
        this.renderPreview();
    }

    mmToPx(mm) {
        return Math.round(mm * this.mmToPixel);
    }

    createZonesForm() {
        const form = document.getElementById('zonesForm');

        if (this.zones.length === 0) {
            form.innerHTML = '<p class="text-muted">Aucune zone définie pour ce template.</p>';
            return;
        }

        form.innerHTML = this.zones.map((zone, index) => `
            <div class="zone-input-group">
                <label>${zone.name || 'Zone ' + (index + 1)}:</label>
                <input 
                    type="text" 
                    id="zone_${index}" 
                    class="form-control" 
                    placeholder="${zone.default || 'Saisir le texte'}"
                    value="${zone.default || ''}"
                    onchange="checkCreator.renderPreview()">
            </div>
        `).join('');
    }

    renderPreview() {
        // Nettoyer
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fond blanc
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Image de fond
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Dessiner chaque zone avec son texte
        this.zones.forEach((zone, index) => {
            const input = document.getElementById(`zone_${index}`);
            const text = input ? input.value : zone.default || '';

            if (text) {
                const left = this.mmToPx(zone.left);
                const top = this.mmToPx(zone.top);
                const width = this.mmToPx(zone.right - zone.left);
                const height = this.mmToPx(zone.bottom - zone.top);

                this.ctx.save();
                this.ctx.fillStyle = '#000000';
                this.ctx.font = `${zone.fontWeight || 'normal'} ${zone.fontSize || 12}px "${zone.font || 'Arial'}"`;
                this.ctx.textBaseline = 'top';

                // Clipper le texte dans la zone
                this.ctx.beginPath();
                this.ctx.rect(left, top, width, height);
                this.ctx.clip();

                this.ctx.fillText(text, left + 5, top + 5);
                this.ctx.restore();
            }
        });
    }

    preview() {
        this.renderPreview();
        document.getElementById('previewInfo').textContent =
            `Aperçu avec ${document.getElementById('checkCount').value} chèque(s)`;
    }

    collectData() {
        const count = parseInt(document.getElementById('checkCount').value) || 1;
        const zones = this.zones.map((zone, index) => {
            const input = document.getElementById(`zone_${index}`);
            return {
                name: zone.name,
                left: zone.left,
                top: zone.top,
                right: zone.right,
                bottom: zone.bottom,
                font: zone.font,
                fontSize: zone.fontSize,
                fontWeight: zone.fontWeight,
                default: zone.default,
                text: input ? input.value : zone.default || ''
            };
        });

        return {
            template_id: this.template.id,
            count: count,
            zones: zones
        };
    }

    async generateJSON() {
        try {
            const data = this.collectData();

            const response = await fetch(BASE_PATH + '/check/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            this.generatedJSON = await response.json();

            // Afficher dans la modal
            document.getElementById('jsonOutput').textContent =
                JSON.stringify(this.generatedJSON, null, 2);
            document.getElementById('jsonModal').style.display = 'flex';

        } catch (error) {
            alert('Erreur lors de la génération: ' + error.message);
        }
    }

    copyJSON() {
        const text = document.getElementById('jsonOutput').textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('JSON copié dans le presse-papier !');
        });
    }

    downloadJSON() {
        if (!this.generatedJSON) {
            this.generateJSON().then(() => this.downloadJSON());
            return;
        }

        const blob = new Blob([JSON.stringify(this.generatedJSON, null, 2)],
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cheques_${this.template.name}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Variable globale pour accès depuis les onclick
let checkCreator;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof templateData !== 'undefined') {
        checkCreator = new CheckCreator(templateData);
    }
});