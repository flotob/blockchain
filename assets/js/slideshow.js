class Slideshow {
    constructor() {
        // DOM Elements
        this.modal = document.querySelector('.slideshow-modal');
        this.closeButton = this.modal.querySelector('.modal-close');
        this.slideContent = this.modal.querySelector('.slide-content');
        this.prevButton = this.modal.querySelector('.nav-button.prev');
        this.nextButton = this.modal.querySelector('.nav-button.next');
        this.indicators = this.modal.querySelector('.slide-indicators');
        
        // Initialize markdown-it
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true
        });
        
        // State
        this.currentProject = null;
        this.currentSlideIndex = 0;
        this.slides = [];
        
        // Load project data
        this.projectData = JSON.parse(document.getElementById('project-data').textContent);
        
        // Bind event listeners
        this.bindEvents();
    }
    
    bindEvents() {
        // Trigger buttons
        document.querySelectorAll('.slideshow-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const projectTitle = e.currentTarget.dataset.projectTitle;
                this.openSlideshow(projectTitle);
            });
        });
        
        // Modal controls
        this.closeButton.addEventListener('click', () => this.closeSlideshow());
        this.prevButton.addEventListener('click', () => this.previousSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeSlideshow();
                    break;
                case 'ArrowLeft':
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    this.nextSlide();
                    break;
            }
        });
    }
    
    async loadNotionSlides(projectKey) {
        try {
            const response = await fetch(`/_slides/${projectKey}/`);
            if (!response.ok) throw new Error('Failed to load slides');
            const files = await response.json();
            return files
                .filter(file => file.endsWith('.md'))
                .sort()
                .map(file => ({ type: 'markdown', path: `/_slides/${projectKey}/${file}` }));
        } catch (error) {
            console.error('Error loading slides:', error);
            return [];
        }
    }

    async loadMarkdownContent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('Failed to load markdown');
            return await response.text();
        } catch (error) {
            console.error('Error loading markdown:', error);
            return '';
        }
    }

    async openSlideshow(projectTitle) {
        this.currentProject = this.projectData.find(p => p.title === projectTitle);
        if (!this.currentProject) return;

        if (this.currentProject.notion_source) {
            this.slides = await this.loadNotionSlides(this.currentProject.key);
        } else {
            return; // No slides to show
        }
        
        if (this.slides.length === 0) return;
        
        this.currentSlideIndex = 0;
        this.modal.classList.add('active');
        await this.updateSlide();
        this.updateNavigation();
    }
    
    closeSlideshow() {
        this.modal.classList.remove('active');
        this.currentProject = null;
        this.currentSlideIndex = 0;
    }
    
    async updateSlide() {
        if (!this.currentProject || !this.slides[this.currentSlideIndex]) return;
        
        const slide = this.slides[this.currentSlideIndex];
        if (slide.type === 'markdown') {
            const content = await this.loadMarkdownContent(slide.path);
            this.slideContent.innerHTML = this.renderMarkdownSlide(content);
        }
    }

    renderMarkdownSlide(markdown) {
        const watermark = `
            <div class="slide-watermark">
                <img src="${this.currentProject.image}" alt="${this.currentProject.title} logo">
            </div>
        `;

        const header = `
            <div class="slide-header">
                <h2>${this.currentProject.title}</h2>
            </div>
        `;

        const footer = `
            <div class="slide-footer">
                <div class="slide-footer-left">
                    <div class="slide-counter">
                        <span class="slide-counter-current">${this.currentSlideIndex + 1}</span>
                        <span>/</span>
                        <span>${this.slides.length}</span>
                    </div>
                    <span>${this.currentProject.role}</span>
                </div>
                <div class="slide-footer-right">
                    <a href="${this.currentProject.url}" target="_blank">
                        Visit Website
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                </div>
            </div>
        `;

        const content = `
            <div class="slide-text">
                ${this.md.render(markdown)}
            </div>
        `;

        return header + watermark + content + footer;
    }
    
    updateNavigation() {
        if (!this.currentProject) return;
        
        this.prevButton.disabled = this.currentSlideIndex === 0;
        this.nextButton.disabled = this.currentSlideIndex === this.slides.length - 1;
        
        // Update indicators
        this.indicators.innerHTML = this.slides.map((_, index) => `
            <button class="indicator ${index === this.currentSlideIndex ? 'active' : ''}"
                    role="tab"
                    aria-selected="${index === this.currentSlideIndex}"
                    aria-label="Slide ${index + 1}">
            </button>
        `).join('');
        
        // Add click handlers to indicators
        this.indicators.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    async previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            await this.updateSlide();
            this.updateNavigation();
        }
    }
    
    async nextSlide() {
        if (this.currentProject && this.currentSlideIndex < this.slides.length - 1) {
            this.currentSlideIndex++;
            await this.updateSlide();
            this.updateNavigation();
        }
    }
    
    async goToSlide(index) {
        if (this.currentProject && index >= 0 && index < this.slides.length) {
            this.currentSlideIndex = index;
            await this.updateSlide();
            this.updateNavigation();
        }
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Slideshow();
}); 