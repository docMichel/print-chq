
// ========================================
// public/js/fabrication.js
// ========================================
class FabricationManager {
    constructor(templates) {
        this.templates = templates;
        this.generatedJSON = null;
    }

    collectData() {
        const result = [];

        this.templates.forEach(template => {
            const countInput = document.querySelector(`input[name="count_${template.id}"]`);
            const textInput = document.querySelector(`input[name="text_${template.id}"]`);

            const count = parseInt(countInput.value) || 0;
            const text = textInput.value.trim();

            if (count > 0) {
                result.push({
                    id: template.id,
                    count: count,
                    text: text
                });
            }
        });

        return result;
    }

    async generateAll() {
        const templates = this.collectData();

        if (templates.length === 0) {
            alert('Aucun template sélectionné (nombre > 0)');
            return;
        }

        try {
            const response = await fetch(BASE_PATH + '/check/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ templates })
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

    async downloadAll() {
        if (!this.generatedJSON) {
            await this.generateAll();
            if (!this.generatedJSON) return;
        }

        const blob = new Blob([JSON.stringify(this.generatedJSON, null, 2)],
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cheques_batch_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Variable globale
let fabricationManager;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof templatesData !== 'undefined') {
        fabricationManager = new FabricationManager(templatesData);
    }
});
