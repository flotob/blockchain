import Modal from './modal.js';
import { initPdfViewer } from './pdf-viewer.js';

// Share mobile detection function
const isMobile = () => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
};

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
        const triggers = document.querySelectorAll('.advocacy-trigger');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                const docData = {
                    title: e.currentTarget.dataset.title,
                    type: e.currentTarget.dataset.type,
                    language: e.currentTarget.dataset.language,
                    organization: e.currentTarget.dataset.organization,
                    year: e.currentTarget.dataset.year,
                    pdfUrl: e.currentTarget.dataset.pdfUrl,
                    totalPages: parseInt(e.currentTarget.dataset.totalPages, 10) || 1
                };
                
                // Validate total pages
                if (isNaN(docData.totalPages) || docData.totalPages < 1) {
                    docData.totalPages = 1;
                }
                
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
                    <span class="year">${docData.year}</span>
                    <span class="doc-type">${docData.type}</span>
                    <span class="doc-language">${docData.language}</span>
                </div>
                <h2 class="doc-title">${docData.title}</h2>
                <div class="advocacy-meta">
                    <span class="organization">${docData.organization}</span>
                </div>
            </div>
        `;
        
        this.headerContainer.innerHTML = header;
    }
    
    updateContent(docData) {
        // Clear existing content
        this.pdfViewer.innerHTML = '';
        
        // Initialize PDF viewer with container ID and document data
        initPdfViewer(
            this.pdfViewer.id || 'pdf-viewer',
            docData.pdfUrl,
            docData.totalPages
        );
    }
    
    updateFooter(docData) {
        // Check if we're on mobile
        const mobile = isMobile();
        
        if (mobile) {
            this.footerContainer.style.display = 'none';
            return;
        }
        
        const footer = `
            <a href="${docData.pdfUrl}" download class="button">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download
            </a>
        `;
        
        this.footerContainer.style.display = 'flex';
        this.footerContainer.innerHTML = footer;
    }
}

// Initialize advocacy modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvocacyModal();
}); 