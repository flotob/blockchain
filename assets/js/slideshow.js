import Modal from './modal.js';

class Slideshow extends Modal {
    constructor() {
        super('.slideshow-modal');
        
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
        this.currentProject = null;
        this.currentSlideIndex = 0;
        this.projectData = JSON.parse(document.getElementById('project-data').textContent);
        
        // Bind slideshow-specific events
        this.bindSlideshowEvents();
    }
    
    bindSlideshowEvents() {
        // Trigger buttons
        document.querySelectorAll('.slideshow-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const projectTitle = e.currentTarget.dataset.projectTitle;
                this.openSlideshow(projectTitle);
            });
        });
        
        // Keyboard navigation for slides
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
            }
        });
    }
    
    openSlideshow(projectTitle) {
        this.currentProject = this.projectData.find(p => p.title === projectTitle);
        if (!this.currentProject || !this.currentProject.slides || this.currentProject.slides.length === 0) return;
        
        this.currentSlideIndex = 0;
        this.updateHeader();
        this.updateSlide();
        this.updateNavigation();
        
        super.open();
    }
    
    updateHeader() {
        const watermark = `
            <div class="slide-watermark">
                <img src="${this.currentProject.image}" alt="${this.currentProject.title} logo">
            </div>
        `;

        const header = `
            <div class="slide-header">
                <h2>${this.currentProject.title}</h2>
                ${watermark}
            </div>
        `;
        
        this.headerContainer.innerHTML = header;
    }
    
    updateSlide() {
        if (!this.currentProject || !this.currentProject.slides[this.currentSlideIndex]) return;
        
        const slide = this.currentProject.slides[this.currentSlideIndex];
        this.modalContent.innerHTML = this.renderSlide(slide);
        
        // Add target="_blank" to all links in the content
        this.modalContent.querySelectorAll('a').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
        
        // Update element references after rendering
        this.prevButton = this.modalContent.querySelector('.nav-button.prev');
        this.nextButton = this.modalContent.querySelector('.nav-button.next');
        this.indicators = this.modalContent.querySelector('.slide-indicators');
        
        // Rebind navigation events
        this.prevButton.addEventListener('click', () => this.previousSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        
        this.updateNavigation();
    }

    renderSlide(slide) {
        const content = `
            <div class="slide-content">
                <div class="slide-text">
                    <div class="content">${this.md.render(slide.content || '')}</div>
                </div>
            </div>
        `;

        const footerTop = `
            <div class="slide-footer">
                <div class="slide-footer-top">
                    <div class="slide-footer-left">
                        <div class="slide-counter">
                            <span class="slide-counter-current">${this.currentSlideIndex + 1}</span>
                            <span>/</span>
                            <span>${this.currentProject.slides.length}</span>
                        </div>
                        <span>${this.md.render(slide.title || '')}</span>
                    </div>
                    <div class="slide-footer-right">
                        <a href="${this.currentProject.url}" target="_blank">
                            🔗 Visit Website
                        </a>
                    </div>
                </div>
                <div class="modal-navigation">
                    <button class="nav-button prev" aria-label="Previous slide">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    
                    <div class="slide-indicators" role="tablist"></div>
                    
                    <button class="nav-button next" aria-label="Next slide">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        return content + footerTop;
    }
    
    updateNavigation() {
        if (!this.currentProject) return;
        
        const slides = this.currentProject.slides;
        this.prevButton.disabled = this.currentSlideIndex === 0;
        this.nextButton.disabled = this.currentSlideIndex === slides.length - 1;
        
        // Update indicators
        this.indicators.innerHTML = slides.map((_, index) => `
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
    
    previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.updateSlide();
            this.updateNavigation();
        }
    }
    
    nextSlide() {
        if (this.currentProject && this.currentSlideIndex < this.currentProject.slides.length - 1) {
            this.currentSlideIndex++;
            this.updateSlide();
            this.updateNavigation();
        }
    }
    
    goToSlide(index) {
        if (this.currentProject && index >= 0 && index < this.currentProject.slides.length) {
            this.currentSlideIndex = index;
            this.updateSlide();
            this.updateNavigation();
        }
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Slideshow();
}); 