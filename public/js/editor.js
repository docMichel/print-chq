// public/js/editor.js - Point d'entrée

import { TemplateEditor } from './editor/TemplateEditor.js';

// Variable globale pour accès depuis les onclick
let editor;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof templateData !== 'undefined' && typeof BASE_PATH !== 'undefined') {
        editor = new TemplateEditor(templateData, BASE_PATH);

        // Exposer globalement pour les onclick HTML
        window.editor = editor;
    }
});