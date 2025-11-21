// public/js/editor/FontManager.js
export class FontManager {
    constructor() {
        this.fonts = [];
        this.loadedFonts = new Set();
    }

    async loadFromAPI(basePath) {
        try {
            const response = await fetch(basePath + '/template/fonts');
            this.fonts = await response.json();

            // Charger dynamiquement les polices dans le DOM
            await this.loadFontFaces();

            console.log(`✓ ${this.fonts.length} polices chargées`);
            return this.fonts;
        } catch (error) {
            console.error('Erreur chargement polices:', error);
            this.fonts = [
                { name: 'BARCODE', path: null },
                { name: 'Arial', path: null },
                { name: 'Helvetica', path: null }
            ];
            return this.fonts;
        }
    }

    async loadFontFaces() {
        const promises = [];

        for (const font of this.fonts) {
            if (font.path && !this.loadedFonts.has(font.name)) {
                const fontFace = new FontFace(font.name, `url(${font.path})`, {
                    style: 'normal',
                    weight: 'normal'
                });

                promises.push(
                    fontFace.load()
                        .then(loadedFace => {
                            document.fonts.add(loadedFace);
                            this.loadedFonts.add(font.name);
                            console.log(`✓ Police chargée: ${font.name}`);
                        })
                        .catch(err => {
                            console.warn(`✗ Erreur chargement ${font.name}:`, err);
                        })
                );
            }
        }

        await Promise.all(promises);
    }

    getFonts() {
        return this.fonts.map(f => f.name);
    }

    // Recherche améliorée de police (comme print.py)
    findBestMatch(requestedFont) {
        if (!requestedFont) return 'Arial';

        const normalize = (str) => {
            return str.toLowerCase()
                .replace(/[-_\s]/g, '')
                .replace(/bold|regular|italic|light|medium/gi, '');
        };

        const requested = normalize(requestedFont);

        // 1. Correspondance exacte
        for (const font of this.fonts) {
            if (normalize(font.name) === requested) {
                return font.name;
            }
        }

        // 2. Correspondance partielle (début)
        for (const font of this.fonts) {
            if (normalize(font.name).startsWith(requested)) {
                return font.name;
            }
        }

        // 3. Correspondance partielle (contient)
        for (const font of this.fonts) {
            if (normalize(font.name).includes(requested)) {
                return font.name;
            }
        }

        // 4. Recherche inversée (requested contient font)
        for (const font of this.fonts) {
            if (requested.includes(normalize(font.name))) {
                return font.name;
            }
        }

        console.warn(`Police "${requestedFont}" non trouvée, fallback Arial`);
        return 'Arial';
    }

    getRenderFont(font) {
        if (font === 'BARCODE') return 'Arial';
        return this.findBestMatch(font);
    }

    generateFontOptions(selectedFont) {
        // Trouver la meilleure correspondance
        const bestMatch = this.findBestMatch(selectedFont);

        return this.fonts.map(f => {
            const style = f.name === 'BARCODE'
                ? 'font-family: Arial; font-weight: bold; color: #e74c3c;'
                : `font-family: "${f.name}"`;

            const isSelected = f.name === bestMatch;

            return `<option value="${f.name}" ${isSelected ? 'selected' : ''} style="${style}">${f.name}</option>`;
        }).join('');
    }
}