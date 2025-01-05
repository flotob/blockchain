import Modal from './modal.js';

class BlogModal extends Modal {
    constructor() {
        super('.blog-modal');
        
        // Initialize markdown-it
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true
        });
        
        // Add target="_blank" to all links
        this.md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            tokens[idx].attrPush(['target', '_blank']);
            tokens[idx].attrPush(['rel', 'noopener noreferrer']);
            return self.renderToken(tokens, idx, options);
        };
        
        // State
        this.currentBlog = null;
        this.blogData = JSON.parse(document.getElementById('blog-data').textContent);
        
        // Get DOM references
        this.headerContainer = this.modal.querySelector('.modal-header-container');
        this.contentContainer = this.modal.querySelector('.modal-content');
        this.footerContainer = this.modal.querySelector('.modal-footer-container');
        
        // Bind blog-specific events
        this.bindBlogEvents();
    }
    
    bindBlogEvents() {
        // Trigger buttons
        document.querySelectorAll('.blog-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const mediumId = e.currentTarget.dataset.mediumId;
                this.openBlog(mediumId);
            });
        });
    }
    
    openBlog(mediumId) {
        // Convert both IDs to strings for comparison
        this.currentBlog = this.blogData.find(b => String(b.id) === String(mediumId));
        if (!this.currentBlog) return;
        
        this.updateHeader();
        this.updateContent();
        this.updateFooter();
        
        super.open();
    }
    
    updateHeader() {
        const header = `
            <div class="blog-header">
                <div class="blog-header-content">
                    <div class="medium-logo">
                        <svg width="24" height="24" viewBox="0 0 1043.63 592.71" fill="currentColor">
                            <path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460 0 296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0 154.06-65.89 279-147.17 279s-147.17-124.94-147.17-279 65.88-279 147.16-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76 249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9 51.76 249.94"></path>
                        </svg>
                    </div>
                    <h2>${this.currentBlog.title}</h2>
                </div>
            </div>
        `;
        
        this.headerContainer.innerHTML = header;
    }
    
    updateContent() {
        // Split at first <hr /> and take the last part, or use full content if no separator
        const parts = this.currentBlog.content.split('<hr />');
        const mainContent = parts.length > 1 ? parts.slice(1).join('<hr />') : this.currentBlog.content;
        
        const content = `
            <div class="blog-content">
                <div class="blog-text">
                    ${this.md.render(mainContent)}
                </div>
            </div>
        `;
        
        this.contentContainer.innerHTML = content;
        
        // Add target="_blank" to all links in the content
        this.contentContainer.querySelectorAll('a').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    }
    
    updateFooter() {
        const footer = `
            <div class="blog-footer">
                <div class="blog-footer-content">
                    <time class="blog-date">${this.currentBlog.date}</time>
                    <a href="${this.currentBlog.original_url}" target="_blank" class="blog-action">
                        Read on Medium
                    </a>
                </div>
            </div>
        `;
        
        this.footerContainer.innerHTML = footer;
    }
}

// Initialize blog modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogModal();
}); 