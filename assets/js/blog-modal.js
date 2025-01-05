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
        
        // State
        this.currentBlog = null;
        this.blogData = JSON.parse(document.getElementById('blog-data').textContent);
        
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
        this.currentBlog = this.blogData.find(b => b.id === mediumId);
        if (!this.currentBlog) return;
        
        this.updateHeader();
        this.updateContent();
        
        super.open();
    }
    
    updateHeader() {
        const header = `
            <div class="blog-header">
                <h2>${this.currentBlog.title}</h2>
                <div class="blog-meta">
                    <span class="blog-date">${this.currentBlog.date}</span>
                </div>
            </div>
        `;
        
        this.headerContainer.innerHTML = header;
    }
    
    updateContent() {
        const content = `
            <div class="blog-content">
                <div class="blog-text">
                    ${this.md.render(this.currentBlog.content)}
                </div>
                ${this.renderFooter()}
            </div>
        `;
        
        this.modalContent.innerHTML = content;
    }
    
    renderFooter() {
        return `
            <div class="blog-footer">
                <div class="blog-actions">
                    <a href="${this.currentBlog.original_url}" target="_blank" class="blog-action">
                        🔗 Read on Medium
                    </a>
                </div>
            </div>
        `;
    }
}

// Initialize blog modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogModal();
}); 