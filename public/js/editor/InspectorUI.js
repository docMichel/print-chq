// public/js/editor/InspectorUI.js

export class InspectorUI {
    constructor(editor) {
        this.editor = editor;
        this.content = document.getElementById('inspectorContent');
    }

    update() {
        if (this.editor.selectedZone === null) {
            this.content.innerHTML = '<p>Sélectionnez une zone</p>';
            return;
        }

        const zone = this.editor.zones[this.editor.selectedZone];
        const fontOptions = this.editor.fontManager.generateFontOptions(zone.font);

        this.content.innerHTML = `
            <div class="inspector-field">
                <label>Nom:</label>
                <input type="text" id="zoneName" value="${zone.name || ''}">
            </div>
            <div class="inspector-field">
                <label>Texte défaut:</label>
                <input type="text" id="zoneDefault" value="${zone.default || ''}" placeholder="Texte par défaut">
            </div>
            <div class="inspector-field">
                <label>Gauche (mm):</label>
                <input type="number" id="zoneLeft" value="${zone.left}" step="0.1">
            </div>
            <div class="inspector-field">
                <label>Haut (mm):</label>
                <input type="number" id="zoneTop" value="${zone.top}" step="0.1">
            </div>
            <div class="inspector-field">
                <label>Droite (mm):</label>
                <input type="number" id="zoneRight" value="${zone.right}" step="0.1">
            </div>
            <div class="inspector-field">
                <label>Bas (mm):</label>
                <input type="number" id="zoneBottom" value="${zone.bottom}" step="0.1">
            </div>
            <div class="inspector-field">
                <label>Largeur (mm):</label>
                <input type="number" id="zoneWidth" value="${(zone.right - zone.left).toFixed(2)}" step="0.1">
            </div>
            <div class="inspector-field">
                <label>Hauteur (mm):</label>
                <input type="number" id="zoneHeight" value="${(zone.bottom - zone.top).toFixed(2)}" step="0.1">
            </div>
            <div class="inspector-field">
                <label>Police:</label>
                <div style="display: flex; gap: 4px;">
                    <select id="zoneFont" style="flex: 1; ${zone.font === 'BARCODE' ? 'font-family: Arial; font-weight: bold; color: #e74c3c;' : `font-family: '${zone.font || 'Arial'}';`}">
                        ${fontOptions}
                    </select>
                    <button onclick="editor.showCustomFont()" class="btn-icon" title="Police personnalisée">✏️</button>
                </div>
            </div>
            <div class="inspector-field" id="customFontField" style="display: none;">
                <label>Nom exact:</label>
                <input type="text" id="zoneCustomFont" placeholder="Nom de la police">
            </div>
            <div class="inspector-field">
                <label>Taille:</label>
                <input type="number" id="zoneFontSize" value="${zone.fontSize || 12}">
            </div>
        `;

        this.setupEventListeners(zone);
    }

    setupEventListeners(zone) {
        const fields = {
            'name': 'string',
            'default': 'string',
            'left': 'number',
            'top': 'number',
            'right': 'number',
            'bottom': 'number',
            'font': 'string',
            'fontSize': 'number'
        };

        Object.keys(fields).forEach(field => {
            const input = document.getElementById(`zone${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (input) {
                const eventType = field === 'font' ? 'change' : 'input';
                input.addEventListener(eventType, (e) => {
                    const value = fields[field] === 'number' ? parseFloat(e.target.value) : e.target.value;
                    if (fields[field] === 'number' && isNaN(value)) return;

                    zone[field] = value;

                    // Mettre à jour le style du select si c'est la police
                    if (field === 'font') {
                        if (value === 'BARCODE') {
                            input.style.fontFamily = 'Arial';
                            input.style.fontWeight = 'bold';
                            input.style.color = '#e74c3c';
                        } else {
                            input.style.fontFamily = value;
                            input.style.fontWeight = 'normal';
                            input.style.color = 'inherit';
                        }
                    }

                    this.editor.renderer.render();
                    this.updateValues();

                    if (field === 'name') {
                        this.updateZoneList();
                    }
                });
            }
        });

        // Largeur et hauteur
        const widthInput = document.getElementById('zoneWidth');
        const heightInput = document.getElementById('zoneHeight');

        if (widthInput) {
            widthInput.addEventListener('input', (e) => {
                const newWidth = parseFloat(e.target.value);
                if (!isNaN(newWidth)) {
                    zone.right = zone.left + newWidth;
                    this.editor.renderer.render();
                    this.updateValues();
                }
            });
        }

        if (heightInput) {
            heightInput.addEventListener('input', (e) => {
                const newHeight = parseFloat(e.target.value);
                if (!isNaN(newHeight)) {
                    zone.bottom = zone.top + newHeight;
                    this.editor.renderer.render();
                    this.updateValues();
                }
            });
        }
    }

    updateValues() {
        if (this.editor.selectedZone === null) return;

        const zone = this.editor.zones[this.editor.selectedZone];
        const fields = ['name', 'default', 'left', 'top', 'right', 'bottom', 'font', 'fontSize'];

        fields.forEach(field => {
            const input = document.getElementById(`zone${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (input && document.activeElement !== input) {
                input.value = zone[field] || '';
            }
        });

        const widthInput = document.getElementById('zoneWidth');
        const heightInput = document.getElementById('zoneHeight');

        if (widthInput && document.activeElement !== widthInput) {
            widthInput.value = (zone.right - zone.left).toFixed(2);
        }
        if (heightInput && document.activeElement !== heightInput) {
            heightInput.value = (zone.bottom - zone.top).toFixed(2);
        }
    }

    updateZoneList() {
        const list = document.getElementById('zoneList');
        list.innerHTML = '';

        this.editor.zones.forEach((zone, index) => {
            const li = document.createElement('li');
            li.textContent = zone.name || `Zone ${index + 1}`;
            li.className = index === this.editor.selectedZone ? 'active' : '';
            li.onclick = () => this.editor.selectZone(index);
            list.appendChild(li);
        });
    }
}