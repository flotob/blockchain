import Modal from './modal.js';
import { initPdfViewer } from './pdf-viewer.js';

// Share mobile detection function
const isMobile = () => {
    const isMobileDevice = window.innerWidth <= 768 || 'ontouchstart' in window;
    console.log('[Advocacy Modal] Device detection:', {
        width: window.innerWidth,
        hasTouch: 'ontouchstart' in window,
        isMobile: isMobileDevice
    });
    return isMobileDevice;
};

class AdvocacyModal extends Modal {
    constructor() {
        super('.advocacy-modal');
        console.log('[Advocacy Modal] Initializing');
        
        // Get DOM references
        this.headerContainer = this.modal.querySelector('.modal-header-container');
        this.contentContainer = this.modal.querySelector('.modal-content');
        this.footerContainer = this.modal.querySelector('.modal-footer-container');
        this.pdfViewer = this.modal.querySelector('.pdf-viewer');
        
        console.log('[Advocacy Modal] DOM elements:', {
            headerFound: !!this.headerContainer,
            contentFound: !!this.contentContainer,
            footerFound: !!this.footerContainer,
            pdfViewerFound: !!this.pdfViewer,
            pdfViewerId: this.pdfViewer?.id
        });
        
        // Bind advocacy-specific events
        this.bindAdvocacyEvents();
    }
    
    bindAdvocacyEvents() {
        // Trigger buttons
        const triggers = document.querySelectorAll('.advocacy-trigger');
        console.log('[Advocacy Modal] Found triggers:', triggers.length);
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('[Advocacy Modal] Trigger clicked:', {
                    dataset: e.currentTarget.dataset
                });
                
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
                    console.error('[Advocacy Modal] Invalid total pages:', e.currentTarget.dataset.totalPages);
                    docData.totalPages = 1;
                }
                
                console.log('[Advocacy Modal] Processed document data:', docData);
                this.openDocument(docData);
            });
        });
    }
    
    openDocument(docData) {
        console.log('[Advocacy Modal] Opening document');
        this.updateHeader(docData);
        this.updateContent(docData);
        this.updateFooter(docData);
        super.open();
    }
    
    updateHeader(docData) {
        console.log('[Advocacy Modal] Updating header');
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
        console.log('[Advocacy Modal] Updating content with PDF viewer');
        // Clear existing content
        this.pdfViewer.innerHTML = '';
        
        console.log('[Advocacy Modal] PDF viewer state:', {
            id: this.pdfViewer.id,
            empty: this.pdfViewer.innerHTML === '',
            dimensions: {
                width: this.pdfViewer.offsetWidth,
                height: this.pdfViewer.offsetHeight
            }
        });
        
        // Initialize PDF viewer with container ID and document data
        initPdfViewer(
            this.pdfViewer.id || 'pdf-viewer',
            docData.pdfUrl,
            docData.totalPages
        );
    }
    
    updateFooter(docData) {
        console.log('[Advocacy Modal] Updating footer');
        
        // Check if we're on mobile
        const mobile = isMobile();
        console.log('[Advocacy Modal] Footer update - device check:', { 
            isMobile: mobile,
            footerContainer: !!this.footerContainer
        });
        
        if (mobile) {
            console.log('[Advocacy Modal] Mobile device - hiding footer');
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
        console.log('[Advocacy Modal] Desktop device - footer updated with download button');
    }
}

// Initialize advocacy modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Advocacy Modal] DOM loaded, initializing modal');
    new AdvocacyModal();
}); 