// public/js/editor/CanvasRenderer.js

export class CanvasRenderer {
    constructor(editor) {
        this.editor = editor;
        this.canvas = editor.canvas;
        this.ctx = editor.ctx;
        this.backgroundImage = null;

        // Conversion mm vers pixels (96 DPI)
        this.mmToPixel = 96 / 25.4;
        this.pixelToMm = 25.4 / 96;
    }

    mmToPx(mm) {
        return Math.round(mm * this.mmToPixel);
    }

    pxToMm(px) {
        return Math.round(px * this.pixelToMm * 100) / 100;
    }

    loadBackgroundImage(imagePath) {
        if (imagePath) {
            this.backgroundImage = new Image();
            this.backgroundImage.onload = () => this.render();
            this.backgroundImage.src = imagePath;
        }
    }

    render() {
        // Nettoyer
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fond blanc
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Image de fond
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Dessiner toutes les zones
        this.editor.zones.forEach((zone, index) => {
            this.drawZone(zone, index === this.editor.selectedZone);
        });
    }

    drawZone(zone, isSelected) {
        const left = this.mmToPx(zone.left);
        const top = this.mmToPx(zone.top);
        const width = this.mmToPx(zone.right - zone.left);
        const height = this.mmToPx(zone.bottom - zone.top);

        // Rectangle semi-transparent
        this.ctx.fillStyle = isSelected ? 'rgba(52, 152, 219, 0.3)' : 'rgba(149, 165, 166, 0.2)';
        this.ctx.fillRect(left, top, width, height);

        // Bordure
        this.ctx.strokeStyle = isSelected ? '#3498db' : '#95a5a6';
        this.ctx.lineWidth = isSelected ? 2 : 1;
        this.ctx.strokeRect(left, top, width, height);

        // Texte par défaut si présent
        if (zone.default) {
            this.ctx.save();
            this.ctx.fillStyle = '#2c3e50';

            // Utiliser Arial pour afficher si BARCODE
            const displayFont = this.editor.fontManager.getRenderFont(zone.font || 'Arial');
            this.ctx.font = `${zone.fontWeight || 'normal'} ${zone.fontSize || 12}px "${displayFont}"`;
            this.ctx.textBaseline = 'top';

            // Clipper le texte dans la zone
            this.ctx.beginPath();
            this.ctx.rect(left + 2, top + 2, width - 4, height - 4);
            this.ctx.clip();

            // Si BARCODE, afficher un indicateur
            const displayText = zone.font === 'BARCODE'
                ? `[BARCODE] ${zone.default}`
                : zone.default;

            this.ctx.fillText(displayText, left + 5, top + 5);
            this.ctx.restore();
        } else if (zone.name) {
            // Nom de la zone si pas de texte par défaut
            this.ctx.fillStyle = isSelected ? '#2c3e50' : '#7f8c8d';
            this.ctx.font = '12px sans-serif';

            // Indiquer si c'est une zone BARCODE
            const displayName = zone.font === 'BARCODE'
                ? `${zone.name} [BARCODE]`
                : zone.name;

            this.ctx.fillText(displayName, left + 5, top + 15);
        }

        // Poignées de redimensionnement si sélectionnée
        if (isSelected) {
            const handleSize = 8;
            this.ctx.fillStyle = '#3498db';

            // Top-left
            this.ctx.fillRect(left - handleSize / 2, top - handleSize / 2, handleSize, handleSize);

            // Bottom-right
            this.ctx.fillRect(left + width - handleSize / 2, top + height - handleSize / 2, handleSize, handleSize);
        }
    }
}