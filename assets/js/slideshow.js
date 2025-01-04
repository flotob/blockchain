class Slideshow {
    constructor() {
        // DOM Elements
        this.modal = document.querySelector('.slideshow-modal');
        this.modalContainer = this.modal.querySelector('.modal-container');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.closeButton = this.modal.querySelector('.modal-close');
        this.headerContainer = this.modalContainer.querySelector('.modal-header-container');
        
        // Initialize markdown-it
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true
        });
        
        // State
        this.currentProject = null;
        this.currentSlideIndex = 0;
        this.scrollPosition = 0;
        this.isDesktop = window.matchMedia('(min-width: 768px)').matches;
        
        // Touch interaction state
        this.touchStart = null;
        this.currentTranslate = 0;
        this.isDragging = false;
        this.startTime = 0;
        this.boundTouchHandlers = {
            start: null,
            move: null,
            end: null
        };
        
        // Load project data
        this.projectData = JSON.parse(document.getElementById('project-data').textContent);
        
        // Bind event listeners
        this.bindEvents();
        
        // Listen for resize events to update isDesktop
        window.addEventListener('resize', () => {
            this.isDesktop = window.matchMedia('(min-width: 768px)').matches;
        });
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
        
        // Close on background click (desktop only)
        this.modal.addEventListener('click', (e) => {
            if (this.isDesktop && e.target === this.modal) {
                this.closeSlideshow();
            }
        });
        
        // Prevent click propagation from modal content
        this.modalContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
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
        
        // Let CSS handle the transform animation
        this.modal.classList.add('active');
        
        // Update header
        this.updateHeader();
        
        // Only bind touch events on mobile
        if (!this.isDesktop) {
            this.bindTouchEvents();
        }
        
        this.updateSlide();
        this.updateNavigation();
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
    
    closeSlideshow() {
        // Reset touch state
        this.isDragging = false;
        this.touchStart = null;
        this.currentTranslate = 0;
        
        // Cleanup touch events
        this.unbindTouchEvents();
        
        // First, trigger the slide-out animation and backdrop fade
        this.modalContainer.style.transform = this.isDesktop ? 'translateX(100%)' : 'translateY(100%)';
        this.modal.style.background = 'rgba(0, 0, 0, 0)';
        
        // Wait for the animation to complete before removing active class
        setTimeout(() => {
            this.modal.classList.remove('active');
            // Clean up transform and background related styles
            this.modalContainer.style.removeProperty('transform');
            this.modalContainer.style.removeProperty('transition');
            this.modal.style.removeProperty('background');
            
            // Reset state
            this.currentProject = null;
            this.currentSlideIndex = 0;
        }, 300); // Match the transition duration from CSS
    }
    
    updateSlide() {
        if (!this.currentProject || !this.currentProject.slides[this.currentSlideIndex]) return;
        
        const slide = this.currentProject.slides[this.currentSlideIndex];
        this.modalContent.innerHTML = this.renderSlide(slide);
        
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
    
    bindTouchEvents() {
        // Create bound handlers that we can later remove
        this.boundTouchHandlers = {
            start: (e) => this.handleTouchStart(e),
            move: (e) => this.handleTouchMove(e),
            end: (e) => this.handleTouchEnd(e)
        };
        
        // Add new listeners to the header container
        this.headerContainer.addEventListener('touchstart', this.boundTouchHandlers.start);
        this.headerContainer.addEventListener('touchmove', this.boundTouchHandlers.move);
        this.headerContainer.addEventListener('touchend', this.boundTouchHandlers.end);
    }
    
    unbindTouchEvents() {
        if (!this.headerContainer || !this.boundTouchHandlers) return;
        
        // Remove listeners using the same bound handlers
        this.headerContainer.removeEventListener('touchstart', this.boundTouchHandlers.start);
        this.headerContainer.removeEventListener('touchmove', this.boundTouchHandlers.move);
        this.headerContainer.removeEventListener('touchend', this.boundTouchHandlers.end);
        
        // Reset handlers
        this.boundTouchHandlers = {
            start: null,
            move: null,
            end: null
        };
    }
    
    handleTouchStart(e) {
        this.touchStart = e.touches[0].clientY;
        this.isDragging = true;
        this.startTime = Date.now();
        
        // Remove transition for direct manipulation
        this.modalContainer.style.transition = 'none';
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - this.touchStart;
        
        // Only allow dragging down
        if (diff < 0) return;
        
        // Convert to percentage of viewport height
        const percentage = (diff / window.innerHeight) * 100;
        this.currentTranslate = percentage;
        
        // Use percentage-based transform
        this.modalContainer.style.transform = `translateY(${percentage}%)`;
        
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Calculate velocity
        const time = Date.now() - this.startTime;
        const velocity = this.currentTranslate / time;
        
        if (this.currentTranslate > 30 || velocity > 0.5) {  // 30% threshold
            // Close immediately, let CSS handle the animation
            this.closeSlideshow();
        } else {
            // Snap back: remove inline transform and let CSS take over
            this.modalContainer.style.transform = '';
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