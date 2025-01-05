// List of section IDs in order
const SECTION_IDS = ['hero', 'work', 'blogs', 'publications', 'interviews', 'events'];

// Initialize navigation
function initNavigation() {
    const upButton = document.getElementById('prevSection');
    const downButton = document.getElementById('nextSection');
    
    if (!upButton || !downButton) {
        console.error('Navigation buttons not found');
        return;
    }

    // Button click handlers
    upButton.addEventListener('click', () => navigateSection('up'));
    downButton.addEventListener('click', () => navigateSection('down'));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                navigateSection('down');
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                navigateSection('up');
                break;
        }
    });

    // Update button states on scroll
    window.addEventListener('scroll', updateButtonStates);
    updateButtonStates(); // Initial state
}

// Get the current section based on scroll position
function getCurrentSectionIndex() {
    const scrollPosition = window.scrollY;
    const sections = SECTION_IDS.map(id => 
        id === 'hero' ? document.querySelector('.hero') : document.getElementById(id)
    ).filter(Boolean);

    return sections.findIndex(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
    });
}

// Navigate to previous/next section
function navigateSection(direction) {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex === -1) return;

    let targetIndex;
    if (direction === 'up') {
        targetIndex = Math.max(0, currentIndex - 1);
    } else {
        targetIndex = Math.min(SECTION_IDS.length - 1, currentIndex + 1);
    }

    const targetId = SECTION_IDS[targetIndex];
    const targetSection = targetId === 'hero' ? 
        document.querySelector('.hero') : 
        document.getElementById(targetId);

    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update navigation button states
function updateButtonStates() {
    const currentIndex = getCurrentSectionIndex();
    const upButton = document.getElementById('prevSection');
    const downButton = document.getElementById('nextSection');

    if (upButton) {
        upButton.disabled = currentIndex <= 0;
    }
    if (downButton) {
        downButton.disabled = currentIndex >= SECTION_IDS.length - 1;
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', initNavigation); 