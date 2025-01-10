import Modal from './modal.js';

class AdvocacyModal extends Modal {
    constructor() {
        super('.advocacy-modal');
        
        // Get DOM references
        this.headerContainer = this.modal.querySelector('.modal-header-container');
        this.contentContainer = this.modal.querySelector('.modal-content');
        this.footerContainer = this.modal.querySelector('.modal-footer-container');
        this.pdfViewer = this.modal.querySelector('.pdf-viewer');
        
        // Bind advocacy-specific events
        this.bindAdvocacyEvents();
    }
    
    bindAdvocacyEvents() {
        // Trigger buttons
        document.querySelectorAll('.advocacy-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const docData = {
                    title: e.currentTarget.dataset.title,
                    type: e.currentTarget.dataset.type,
                    language: e.currentTarget.dataset.language,
                    organization: e.currentTarget.dataset.organization,
                    year: e.currentTarget.dataset.year,
                    pdfUrl: e.currentTarget.dataset.pdfUrl
                };
                this.openDocument(docData);
            });
        });
    }
    
    openDocument(docData) {
        this.updateHeader(docData);
        this.updateContent(docData);
        this.updateFooter(docData);
        super.open();
    }
    
    updateHeader(docData) {
        const header = `
            <div class="document-info">
                <div class="doc-meta">
                    <span class="doc-type">${docData.type}</span>
                    <span class="doc-language">${docData.language}</span>
                </div>
                <h2 class="doc-title">${docData.title}</h2>
                <div class="advocacy-meta">
                    <span class="organization">${docData.organization}</span>
                    <span class="year">${docData.year}</span>
                </div>
            </div>
        `;
        
        this.headerContainer.innerHTML = header;
    }
    
    updateContent(docData) {
        this.pdfViewer.src = docData.pdfUrl;
    }
    
    updateFooter(docData) {
        const footer = `
            <a href="${docData.pdfUrl}" download class="button">
                Download PDF
            </a>
        `;
        
        this.footerContainer.innerHTML = footer;
    }
}

// Initialize advocacy modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvocacyModal();
}); 