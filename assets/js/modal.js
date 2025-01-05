class Modal {
    constructor(modalSelector) {
        // DOM Elements
        this.modal = document.querySelector(modalSelector);
        this.modalContainer = this.modal.querySelector('.modal-container');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.closeButton = this.modal.querySelector('.modal-close');
        this.headerContainer = this.modalContainer.querySelector('.modal-header-container');
        
        // State
        this.isDesktop = window.matchMedia('(min-width: 768px)').matches;
        this.isResizing = false;
        this.initialX = 0;
        this.initialWidth = 0;
        
        // Constants
        this.MIN_WIDTH = 400;
        this.MAX_WIDTH = window.innerWidth * 0.8;
        
        // Touch interaction state
        this.touchStart = null;
        this.currentTranslate = 0;
        this.isDragging = false;
        this.startTime = 0;
        
        // Bind event listeners
        this.bindEvents();
        
        // Listen for resize events to update isDesktop
        window.addEventListener('resize', () => {
            this.isDesktop = window.matchMedia('(min-width: 768px)').matches;
        });
        
        // Initialize resize functionality for desktop
        if (this.isDesktop) {
            this.initResizeHandle();
        }
    }
    
    initResizeHandle() {
        const resizeHandle = this.modalContainer;
        
        const startResize = (e) => {
            // Only handle left edge resize
            const handleWidth = 20;
            if (e.clientX > resizeHandle.getBoundingClientRect().left + handleWidth) return;
            
            this.isResizing = true;
            this.initialX = e.clientX;
            this.initialWidth = resizeHandle.offsetWidth;
            this.modal.classList.add('resizing');
            
            // Prevent text selection while resizing
            document.body.style.userSelect = 'none';
        };
        
        const doResize = (e) => {
            if (!this.isResizing) return;
            
            const delta = this.initialX - e.clientX;
            const newWidth = Math.min(Math.max(this.initialWidth + delta, this.MIN_WIDTH), this.MAX_WIDTH);
            
            resizeHandle.style.width = `${newWidth}px`;
            
            // Store the preferred width
            localStorage.setItem('modalWidth', newWidth);
        };
        
        const stopResize = () => {
            if (!this.isResizing) return;
            
            this.isResizing = false;
            this.modal.classList.remove('resizing');
            document.body.style.userSelect = '';
        };
        
        // Add event listeners
        resizeHandle.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        
        // Restore preferred width if available
        const preferredWidth = localStorage.getItem('modalWidth');
        if (preferredWidth) {
            resizeHandle.style.width = `${preferredWidth}px`;
        }
    }
    
    bindEvents() {
        // Close button
        this.closeButton.addEventListener('click', () => this.close());
        
        // Close on background click (all devices)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Prevent click propagation from modal content
        this.modalContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    open() {
        this.modal.classList.add('active');
        
        // Only bind touch events on mobile
        if (!this.isDesktop) {
            this.bindTouchEvents();
        }
    }
    
    close() {
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
        }, 300); // Match the transition duration from CSS
    }
    
    bindTouchEvents() {
        this.boundTouchHandlers = {
            start: (e) => this.handleTouchStart(e),
            move: (e) => this.handleTouchMove(e),
            end: (e) => this.handleTouchEnd(e)
        };
        
        this.headerContainer.addEventListener('touchstart', this.boundTouchHandlers.start);
        this.headerContainer.addEventListener('touchmove', this.boundTouchHandlers.move);
        this.headerContainer.addEventListener('touchend', this.boundTouchHandlers.end);
    }
    
    unbindTouchEvents() {
        if (!this.headerContainer || !this.boundTouchHandlers) return;
        
        this.headerContainer.removeEventListener('touchstart', this.boundTouchHandlers.start);
        this.headerContainer.removeEventListener('touchmove', this.boundTouchHandlers.move);
        this.headerContainer.removeEventListener('touchend', this.boundTouchHandlers.end);
        
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
            this.close();
        } else {
            // Snap back: remove inline transform and let CSS take over
            this.modalContainer.style.transform = '';
        }
        
        this.touchStart = null;
        this.currentTranslate = 0;
    }
}

// Export for use in other files
export default Modal; 