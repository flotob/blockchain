class Slideshow {
    constructor() {
        // DOM Elements
        this.modal = document.querySelector('.slideshow-modal');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.closeButton = this.modal.querySelector('.modal-close');
        this.slideContent = this.modal.querySelector('.modal-content');
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
        
        // Touch interaction state
        this.touchStart = null;
        this.currentTranslate = 0;
        this.isDragging = false;
        this.startTime = 0;
        
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
    
    openSlideshow(projectTitle) {
        this.currentProject = this.projectData.find(p => p.title === projectTitle);
        if (!this.currentProject || !this.currentProject.slides || this.currentProject.slides.length === 0) return;
        
        this.currentSlideIndex = 0;
        this.modal.classList.add('active');
        this.updateSlide();
        this.updateNavigation();
        
        // Bind touch events after slide is rendered
        if (this.isMobile()) {
            this.header = this.modal.querySelector('.slide-header');
            this.bindTouchEvents();
        }
    }
    
    closeSlideshow() {
        this.modalContent.style.transform = '';
        this.modal.style.background = '';
        this.modal.classList.remove('active');
        this.unlockScroll();
        this.currentProject = null;
        this.currentSlideIndex = 0;
    }
    
    updateSlide() {
        if (!this.currentProject || !this.currentProject.slides[this.currentSlideIndex]) return;
        
        const slide = this.currentProject.slides[this.currentSlideIndex];
        const slideContent = this.modal.querySelector('.slide-content');
        slideContent.innerHTML = this.renderSlide(slide);
        this.updateNavigation();
    }

    renderSlide(slide) {
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

        const content = `
            <div class="slide-text">
                <h3>${this.md.render(slide.title || '')}</h3>
                <div class="content">${this.md.render(slide.content || '')}</div>
            </div>
        `;

        const footer = `
            <div class="slide-footer">
                <div class="slide-footer-top">
                    <div class="slide-footer-left">
                        <div class="slide-counter">
                            <span class="slide-counter-current">${this.currentSlideIndex + 1}</span>
                            <span>/</span>
                            <span>${this.currentProject.slides.length}</span>
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
            </div>
        `;

        return header + content + footer;
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
    
    bindTouchEvents() {
        if (!this.header) return;
        
        // Remove existing listeners first to prevent duplicates
        this.header.removeEventListener('touchstart', this.handleTouchStart);
        this.header.removeEventListener('touchmove', this.handleTouchMove);
        this.header.removeEventListener('touchend', this.handleTouchEnd);
        
        // Add new listeners
        this.header.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.header.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.header.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    handleTouchStart(e) {
        this.touchStart = e.touches[0].clientY;
        this.isDragging = true;
        this.startTime = Date.now();
        this.modalContent.style.transition = 'none';
        this.modal.style.transition = 'none';
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - this.touchStart;
        
        // Only allow dragging down
        if (diff < 0) return;
        
        // Add resistance to the drag
        this.currentTranslate = diff * 0.5;
        
        // Apply transform only to the content
        this.modalContent.style.transform = `translateY(${this.currentTranslate}px)`;
        
        // Super aggressive fade - start fading immediately
        const fadeProgress = Math.min(this.currentTranslate / (window.innerHeight * 0.3), 1);
        this.modal.style.background = `rgba(0, 0, 0, ${0.95 * (1 - fadeProgress * 2)})`;
        
        // Prevent default scroll
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.modalContent.style.transition = 'transform 0.3s ease';
        this.modal.style.transition = 'background 0.3s ease';
        
        // Calculate velocity
        const time = Date.now() - this.startTime;
        const velocity = this.currentTranslate / time;
        
        // Dismiss if dragged far enough or flicked fast enough
        if (this.currentTranslate > window.innerHeight * 0.3 || velocity > 0.5) {
            this.modalContent.style.transform = `translateY(${window.innerHeight}px)`;
            this.modal.style.background = 'rgba(0, 0, 0, 0)';
            setTimeout(() => this.closeSlideshow(), 300);
        } else {
            // Snap back
            this.modalContent.style.transform = 'translateY(0)';
            this.modal.style.background = 'rgba(0, 0, 0, 0.95)';
        }
        
        this.touchStart = null;
        this.currentTranslate = 0;
    }
    
    isMobile() {
        return window.innerWidth <= 768;
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Slideshow();
}); 