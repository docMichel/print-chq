// public/js/editor/MouseHandler.js

export class MouseHandler {
    constructor(editor) {
        this.editor = editor;
        this.canvas = editor.canvas;
        this.dragging = false;
        this.resizing = false;
        this.resizeHandle = null;
        this.dragStart = null;
        this.originalState = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    findZoneAtPos(x, y) {
        for (let i = this.editor.zones.length - 1; i >= 0; i--) {
            const zone = this.editor.zones[i];
            const left = this.editor.renderer.mmToPx(zone.left);
            const top = this.editor.renderer.mmToPx(zone.top);
            const right = this.editor.renderer.mmToPx(zone.right);
            const bottom = this.editor.renderer.mmToPx(zone.bottom);
            
            if (x >= left && x <= right && y >= top && y <= bottom) {
                return i;
            }
        }
        return null;
    }
    
    getResizeHandle(x, y, zoneIndex) {
        const zone = this.editor.zones[zoneIndex];
        const left = this.editor.renderer.mmToPx(zone.left);
        const top = this.editor.renderer.mmToPx(zone.top);
        const right = this.editor.renderer.mmToPx(zone.right);
        const bottom = this.editor.renderer.mmToPx(zone.bottom);
        const threshold = 8;
        
        // Top-left
        if (Math.abs(x - left) < threshold && Math.abs(y - top) < threshold) {
            return 'tl';
        }
        
        // Bottom-right
        if (Math.abs(x - right) < threshold && Math.abs(y - bottom) < threshold) {
            return 'br';
        }
        
        return null;
    }
    
    onMouseDown(e) {
        const pos = this.getMousePos(e);
        
        // Vérifier si on clique sur une poignée
        if (this.editor.selectedZone !== null) {
            const handle = this.getResizeHandle(pos.x, pos.y, this.editor.selectedZone);
            if (handle) {
                this.resizing = true;
                this.resizeHandle = handle;
                this.dragStart = pos;
                this.originalState = {...this.editor.zones[this.editor.selectedZone]};
                return;
            }
        }
        
        // Sinon, sélectionner/déplacer une zone
        const zoneIndex = this.findZoneAtPos(pos.x, pos.y);
        
        if (zoneIndex !== null) {
            this.editor.selectedZone = zoneIndex;
            this.dragging = true;
            this.dragStart = pos;
            this.originalState = {...this.editor.zones[zoneIndex]};
            this.canvas.classList.add('grabbing');
        } else {
            this.editor.selectedZone = null;
        }
        
        this.editor.renderer.render();
        this.editor.inspector.update();
        this.editor.inspector.updateZoneList();
    }
    
    onMouseMove(e) {
        const pos = this.getMousePos(e);
        
        // Changer le curseur sur les poignées
        if (this.editor.selectedZone !== null && !this.dragging && !this.resizing) {
            const handle = this.getResizeHandle(pos.x, pos.y, this.editor.selectedZone);
            if (handle) {
                this.canvas.style.cursor = 'nwse-resize';
            } else if (this.findZoneAtPos(pos.x, pos.y) === this.editor.selectedZone) {
                this.canvas.style.cursor = 'move';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }
        }
        
        if (this.dragging && this.editor.selectedZone !== null) {
            const dx = pos.x - this.dragStart.x;
            const dy = pos.y - this.dragStart.y;
            const dxMm = this.editor.renderer.pxToMm(dx);
            const dyMm = this.editor.renderer.pxToMm(dy);
            
            const zone = this.editor.zones[this.editor.selectedZone];
            zone.left = this.originalState.left + dxMm;
            zone.right = this.originalState.right + dxMm;
            zone.top = this.originalState.top + dyMm;
            zone.bottom = this.originalState.bottom + dyMm;
            
            this.editor.renderer.render();
            this.editor.inspector.updateValues();
        }
        
        if (this.resizing && this.editor.selectedZone !== null) {
            const zone = this.editor.zones[this.editor.selectedZone];
            const dx = pos.x - this.dragStart.x;
            const dy = pos.y - this.dragStart.y;
            const dxMm = this.editor.renderer.pxToMm(dx);
            const dyMm = this.editor.renderer.pxToMm(dy);
            
            if (this.resizeHandle === 'tl') {
                zone.left = this.originalState.left + dxMm;
                zone.top = this.originalState.top + dyMm;
            } else if (this.resizeHandle === 'br') {
                zone.right = this.originalState.right + dxMm;
                zone.bottom = this.originalState.bottom + dyMm;
            }
            
            this.editor.renderer.render();
            this.editor.inspector.updateValues();
        }
    }
    
    onMouseUp(e) {
        this.dragging = false;
        this.resizing = false;
        this.resizeHandle = null;
        this.canvas.classList.remove('grabbing');
        this.canvas.style.cursor = 'crosshair';
    }
    
    onDoubleClick(e) {
        const pos = this.getMousePos(e);
        const zoneIndex = this.findZoneAtPos(pos.x, pos.y);
        
        if (zoneIndex !== null) {
            const newName = prompt('Nom de la zone:', this.editor.zones[zoneIndex].name || '');
            if (newName !== null) {
                this.editor.zones[zoneIndex].name = newName;
                this.editor.renderer.render();
                this.editor.inspector.updateZoneList();
            }
        }
    }
    
    onKeyDown(e) {
        if (this.editor.selectedZone === null) return;
        
        const zone = this.editor.zones[this.editor.selectedZone];
        const step = e.shiftKey ? 5 : 1; // 5mm avec Shift, 1mm sinon
        
        switch(e.key) {
            case 'ArrowLeft':
                zone.left -= step;
                zone.right -= step;
                e.preventDefault();
                break;
            case 'ArrowRight':
                zone.left += step;
                zone.right += step;
                e.preventDefault();
                break;
            case 'ArrowUp':
                zone.top -= step;
                zone.bottom -= step;
                e.preventDefault();
                break;
            case 'ArrowDown':
                zone.top += step;
                zone.bottom += step;
                e.preventDefault();
                break;
        }
        
        this.editor.renderer.render();
        this.editor.inspector.updateValues();
    }
}