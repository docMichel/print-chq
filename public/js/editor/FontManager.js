// public/js/editor/FontManager.js

export class FontManager {
    constructor() {
        this.fonts = [];
    }

    async loadFromAPI(basePath) {
        try {
            const response = await fetch(basePath + '/template/fonts');
            this.fonts = await response.json();
            console.log(`✓ ${this.fonts.length} polices chargées depuis /fonts`);
            return this.fonts;
        } catch (error) {
            console.error('Erreur chargement polices:', error);
            this.fonts = ['BARCODE', 'Arial', 'Helvetica'];
            return this.fonts;
        }
    }

    getFonts() {
        return this.fonts;
    }

    // Retourne Arial si BARCODE (pour le rendu canvas)
    getRenderFont(font) {
        return font === 'BARCODE' ? 'Arial' : font;
    }

    // Ajouter une police personnalisée
    addCustomFont(fontName) {
        if (!this.fonts.includes(fontName)) {
            this.fonts.push(fontName);
            this.fonts.sort();
            // Garder BARCODE en premier
            this.fonts = this.fonts.filter(f => f !== 'BARCODE');
            this.fonts.unshift('BARCODE');
        }
    }

    // Générer les options HTML pour le select
    generateFontOptions(selectedFont) {
        return this.fonts.map(f => {
            const style = f === 'BARCODE'
                ? 'font-family: Arial; font-weight: bold; color: #e74c3c;'
                : `font-family: '${f}'`;

            return `<option value="${f}" ${selectedFont === f ? 'selected' : ''} style="${style}">${f}</option>`;
        }).join('');
    }
}