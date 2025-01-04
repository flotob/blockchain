// Constants and state
const SECTION_IDS = ['hero', 'work', 'blogs', 'publications', 'interviews', 'events'];
let sectionElements = [];
let isNavigating = false;
let debugOverlay = null;

// Set debug mode based on URL parameter
window.DEBUG = new URLSearchParams(window.location.search).has('debug');

// Initialize debug overlay if needed
function initDebugOverlay() {
    if (!window.DEBUG) return;
    
    debugOverlay = document.createElement('div');
    debugOverlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    document.body.appendChild(debugOverlay);
}

// Update debug overlay
function updateDebugOverlay() {
    if (!window.DEBUG || !debugOverlay) return;
    
    const currentSection = getCurrentSection();
    const debugInfo = {
        currentSection: currentSection?.id || 'none',
        scroll: Math.round(window.scrollY),
        viewport: window.innerHeight,
        sections: sectionElements.map(s => ({
            id: s.id,
            visibility: (s.visibilityRatio * 100).toFixed(1) + '%',
            needsAttention: s.visibilityRatio < 0.8 && s.visibilityRatio > 0 ? '⚠️' : ''
        }))
    };
    
    debugOverlay.innerHTML = `
        <div><strong>Current:</strong> ${debugInfo.currentSection}</div>
        <div><strong>Scroll:</strong> ${debugInfo.scroll}</div>
        <div><strong>Viewport:</strong> ${debugInfo.viewport}</div>
        <div><strong>Sections:</strong></div>
        ${debugInfo.sections.map(s => 
            `<div style="padding-left: 10px">
                ${s.id}: ${s.visibility} ${s.needsAttention}
            </div>`
        ).join('')}
    `;
}

// Touch handling
let touchStartY = 0;
let touchEndY = 0;
const TOUCH_THRESHOLD = 50; // Minimum swipe distance

// Add this helper function at the top with other state management
function isAtDocumentBottom(threshold = 5) {
    const currentScroll = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );
    return currentScroll + viewportHeight >= documentHeight - threshold;
}

// Add after other state management variables
const DEBUG = true; // We can disable verbose logging later

// Add this helper function
function getVisibilityRatio(section) {
    const viewportHeight = window.innerHeight;
    const rect = section.element.getBoundingClientRect();
    
    // Calculate how much of the section is visible
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const ratio = visibleHeight / rect.height;
    
    if (DEBUG) {
        console.log('Visibility check:', {
            section: section.id,
            visibleHeight,
            totalHeight: rect.height,
            ratio: ratio.toFixed(2),
            viewportHeight,
            rect: {
                top: rect.top.toFixed(0),
                bottom: rect.bottom.toFixed(0),
                visibleTop: visibleTop.toFixed(0),
                visibleBottom: visibleBottom.toFixed(0)
            }
        });
    }
    
    return ratio;
}

// Initialize navigation
function initNavigation() {
    // Initialize debug overlay first
    initDebugOverlay();
    
    // Get navigation buttons - using IDs for consistency
    const upButton = document.getElementById('prevSection');
    const downButton = document.getElementById('nextSection');
    
    if (!upButton || !downButton) {
        console.error('Navigation buttons not found');
        return;
    }

    // Initial sections calculation
    updateSectionElements();

    // Event listeners
    window.addEventListener('resize', debounce(updateSectionElements, 150));
    window.addEventListener('scroll', debounce(updateButtonStates, 50));

    // Button click handlers
    upButton.addEventListener('click', () => {
        if (window.DEBUG) console.log('Up button clicked');
        handleNavigation('up');
    });
    downButton.addEventListener('click', () => {
        if (window.DEBUG) console.log('Down button clicked');
        handleNavigation('down');
    });

    // Add touch handlers
    initTouchHandlers();
    
    // Add keyboard navigation
    initKeyboardNavigation();
    
    // Initial button states
    updateButtonStates();

    // Add debug overlay update to scroll handler
    if (window.DEBUG) {
        window.addEventListener('scroll', debounce(updateDebugOverlay, 100));
    }
}

// Update sections data
function updateSectionElements() {
    sectionElements = SECTION_IDS.map(id => {
        // Special handling for hero section
        const element = id === 'hero' ? document.querySelector('.hero') : document.getElementById(id);
        if (!element) {
            if (window.DEBUG) console.warn(`Section ${id} not found`);
            return null;
        }

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // Calculate visibility ratio considering the full viewport
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibilityRatio = visibleHeight / rect.height;
        
        return {
            id,
            element,
            rect,
            top: scrollY + rect.top,
            bottom: scrollY + rect.bottom,
            height: rect.height,
            isLongSection: rect.height > viewportHeight,
            visibilityRatio
        };
    }).filter(Boolean);

    if (window.DEBUG) {
        updateDebugOverlay();
        console.log('Updated sections:', sectionElements.map(s => ({
            id: s.id,
            top: Math.round(s.top),
            bottom: Math.round(s.bottom),
            height: Math.round(s.height),
            visibilityRatio: s.visibilityRatio.toFixed(2)
        })));
    }
    
    updateButtonStates();
}

// Update button states based on scroll position
function updateButtonStates() {
    const upButton = document.getElementById('prevSection');
    const downButton = document.getElementById('nextSection');
    
    if (!upButton || !downButton || !sectionElements.length) return;

    const currentScroll = window.scrollY;
    
    // Find current section
    const currentSection = getCurrentSection();
    if (!currentSection) return;

    // Up button logic
    const isAtTop = currentScroll <= sectionElements[0].top + 5; // Small threshold for better UX
    upButton.disabled = isAtTop;
    
    // Down button logic
    const isBottom = isAtDocumentBottom(5);
    downButton.disabled = isBottom;

    // Update button visibility classes
    upButton.classList.toggle('hidden', isAtTop);
    downButton.classList.toggle('hidden', isBottom);
}

// Find current section with special handling for top of page
function getCurrentSection() {
    const currentScroll = window.scrollY;
    const viewportHeight = window.innerHeight;
    const VISIBILITY_THRESHOLD = 0.3;
    
    // Special handling for the very top of the page
    if (currentScroll <= 5 && sectionElements.length > 0) {
        return sectionElements[0]; // This should be the hero section
    }
    
    // First try to find a section that's significantly in view
    const visibleSection = sectionElements.find(section => {
        const sectionTop = section.top;
        const sectionBottom = section.bottom;
        const viewportBottom = currentScroll + viewportHeight;
        const viewportTop = currentScroll;
        
        // A section is considered "current" if:
        // 1. Its top is above the viewport bottom AND
        // 2. Its bottom is below the viewport top AND
        // 3. It has significant visibility
        const isInView = sectionTop < viewportBottom && 
                        sectionBottom > viewportTop &&
                        section.visibilityRatio >= VISIBILITY_THRESHOLD;
        
        if (window.DEBUG && isInView) {
            console.log('Section in view:', {
                id: section.id,
                sectionTop: Math.round(sectionTop),
                sectionBottom: Math.round(sectionBottom),
                viewportTop: Math.round(viewportTop),
                viewportBottom: Math.round(viewportBottom),
                visibilityRatio: section.visibilityRatio.toFixed(2)
            });
        }
        
        return isInView;
    });
    
    if (visibleSection) {
        if (window.DEBUG) {
            console.log('Found visible section:', {
                id: visibleSection.id,
                visibilityRatio: visibleSection.visibilityRatio.toFixed(2)
            });
        }
        return visibleSection;
    }
    
    // If no section is significantly visible, find the nearest one
    return sectionElements.reduce((nearest, section) => {
        if (!nearest) return section;
        
        const sectionDistance = Math.min(
            Math.abs(section.top - currentScroll),
            Math.abs(section.bottom - (currentScroll + viewportHeight))
        );
        const nearestDistance = Math.min(
            Math.abs(nearest.top - currentScroll),
            Math.abs(nearest.bottom - (currentScroll + viewportHeight))
        );
        
        return sectionDistance < nearestDistance ? section : nearest;
    }, null);
}

// Calculate next scroll position
function getNextScrollPosition(direction) {
    const currentScroll = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );
    
    // Update sections before calculating
    updateSectionElements();
    
    // Find current section
    const currentSection = getCurrentSection();
    
    if (window.DEBUG) {
        console.log('Navigation Debug:', {
            direction,
            currentScroll: Math.round(currentScroll),
            viewportHeight,
            documentHeight,
            currentSection: currentSection ? {
                id: currentSection.id,
                top: Math.round(currentSection.top),
                bottom: Math.round(currentSection.bottom),
                height: Math.round(currentSection.height),
                isLongSection: currentSection.isLongSection,
                visibilityRatio: currentSection.visibilityRatio.toFixed(2)
            } : null
        });
    }
    
    if (!currentSection) return currentScroll;
    
    if (direction === 'down') {
        // Check if we're at the bottom
        if (isAtDocumentBottom(5)) {
            console.log('Already at bottom, no further scrolling');
            return currentScroll;
        }
        
        // If we're not at a section boundary
        const remainingInSection = currentSection.bottom - (currentScroll + viewportHeight);
        if (remainingInSection > 0) {
            // If less than one viewport remains in the section, jump to next section
            if (remainingInSection < viewportHeight / 2) {
                const nextSectionIndex = sectionElements.indexOf(currentSection) + 1;
                if (nextSectionIndex < sectionElements.length) {
                    const nextSection = sectionElements[nextSectionIndex];
                    if (window.DEBUG) {
                        console.log('Small remainder, jumping to next section:', {
                            currentSection: currentSection.id,
                            nextSection: nextSection.id,
                            remainingInSection: Math.round(remainingInSection)
                        });
                    }
                    return nextSection.top;
                }
            }
            
            // Otherwise, move one viewport down
            const nextScroll = Math.min(
                currentSection.bottom - viewportHeight,
                currentScroll + viewportHeight
            );
            
            if (window.DEBUG) {
                console.log('Scrolling within section:', {
                    currentScroll: Math.round(currentScroll),
                    nextScroll: Math.round(nextScroll),
                    sectionBottom: Math.round(currentSection.bottom),
                    remainingInSection: Math.round(remainingInSection),
                    viewportHeight
                });
            }
            return nextScroll;
        }
        
        // Find next section
        const nextSectionIndex = sectionElements.indexOf(currentSection) + 1;
        if (nextSectionIndex < sectionElements.length) {
            const nextSection = sectionElements[nextSectionIndex];
            if (window.DEBUG) {
                console.log('Moving to next section:', {
                    from: currentSection.id,
                    to: nextSection.id
                });
            }
            return nextSection.top;
        }
    } else { // direction === 'up'
        // If we're not at section top
        const scrolledInSection = currentScroll - currentSection.top;
        if (scrolledInSection > 5) { // Small threshold
            // If less than half viewport scrolled in section, jump to section top
            if (scrolledInSection < viewportHeight / 2) {
                if (window.DEBUG) {
                    console.log('Small scroll in section, moving to top:', {
                        section: currentSection.id,
                        scrolledInSection: Math.round(scrolledInSection)
                    });
                }
                return currentSection.top;
            }
            
            // Otherwise move one viewport up
            const nextScroll = Math.max(
                currentSection.top,
                currentScroll - viewportHeight
            );
            
            if (window.DEBUG) {
                console.log('Scrolling up within section:', {
                    currentScroll: Math.round(currentScroll),
                    nextScroll: Math.round(nextScroll),
                    sectionTop: Math.round(currentSection.top),
                    scrolledInSection: Math.round(scrolledInSection)
                });
            }
            return nextScroll;
        }
        
        // Go to previous section
        const prevSectionIndex = sectionElements.indexOf(currentSection) - 1;
        if (prevSectionIndex >= 0) {
            const prevSection = sectionElements[prevSectionIndex];
            if (window.DEBUG) {
                console.log('Moving to previous section:', {
                    from: currentSection.id,
                    to: prevSection.id
                });
            }
            return prevSection.isLongSection ? 
                prevSection.bottom - viewportHeight : 
                prevSection.top;
        }
    }
    
    return currentScroll; // No change if no valid move
}

// Handle navigation button clicks
function handleNavigation(direction) {
    if (window.DEBUG) console.log('Navigation triggered:', direction);
    if (isNavigating) {
        if (window.DEBUG) console.log('Already navigating, ignoring');
        return;
    }
    
    // Early exit if at document boundaries
    if (direction === 'down' && isAtDocumentBottom(5)) {
        if (window.DEBUG) console.log('Already at bottom, ignoring');
        updateButtonStates(); // Ensure buttons are in correct state
        return;
    }
    
    const targetScroll = getNextScrollPosition(direction);
    if (window.DEBUG) console.log('Target scroll position:', targetScroll);
    if (targetScroll === window.scrollY) {
        if (window.DEBUG) console.log('No scroll needed, already at target');
        return;
    }
    
    isNavigating = true;
    let lastScroll = window.scrollY;
    let stuckCount = 0;
    
    // Use requestAnimationFrame for smooth scrolling
    window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
    
    // Reset isNavigating after animation
    const checkScrollEnd = () => {
        const currentScroll = window.scrollY;
        const viewportHeight = window.innerHeight;
        const diff = Math.abs(currentScroll - targetScroll);
        
        if (window.DEBUG) {
            console.log('Checking scroll end:', {
                currentScroll,
                targetScroll,
                difference: diff,
                isNavigating,
                stuckCount,
                lastScrollDiff: Math.abs(currentScroll - lastScroll)
            });
        }
        
        // Check if we're stuck (no scroll movement)
        if (Math.abs(currentScroll - lastScroll) < 0.1) {
            stuckCount++;
        } else {
            stuckCount = 0;
        }
        
        // End conditions
        const isAtTarget = diff < 5;
        const hasPassedTarget = (direction === 'down' && currentScroll >= targetScroll) ||
                              (direction === 'up' && currentScroll <= targetScroll);
        const isStuck = stuckCount > 5; // About 5 frames with no movement
        
        if (isAtTarget || hasPassedTarget || isStuck) {
            isNavigating = false;
            updateButtonStates();
            if (window.DEBUG) {
                console.log('Navigation complete:', { 
                    reason: isAtTarget ? 'reached target' : 
                            hasPassedTarget ? 'passed target' : 
                            'stuck at position'
                });
            }
            
            // If we're stuck and there's still a significant difference,
            // try to jump to the next section only if we're not at document boundaries
            if (isStuck && diff > viewportHeight / 2 && !isAtDocumentBottom(5)) {
                const currentSection = getCurrentSection();
                if (!currentSection) return;
                
                const isLastSection = currentSection === sectionElements[sectionElements.length - 1];
                const isFirstSection = currentSection === sectionElements[0];
                
                // Only try next section if we're not at the boundaries
                if ((direction === 'down' && !isLastSection) || 
                    (direction === 'up' && !isFirstSection)) {
                    if (window.DEBUG) console.log('Stuck with large difference, trying next section');
                    setTimeout(() => {
                        const currentIndex = sectionElements.indexOf(currentSection);
                        const nextSection = direction === 'down' ? 
                            sectionElements[currentIndex + 1] : 
                            sectionElements[currentIndex - 1];
                            
                        if (nextSection) {
                            if (window.DEBUG) console.log('Jumping to next section:', nextSection.id);
                            window.scrollTo({
                                top: nextSection.top,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                }
            }
        } else {
            lastScroll = currentScroll;
            requestAnimationFrame(checkScrollEnd);
        }
    };
    
    requestAnimationFrame(checkScrollEnd);
}

// Debounce utility
function debounce(func, wait) {
    let timeout = null;
    return function (...args) {
        if (timeout) {
            window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            func.apply(this, args);
            timeout = null;
        }, wait);
    };
}

// Touch handling
function initTouchHandlers() {
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', () => {
        const touchDiff = touchEndY - touchStartY;
        
        // Ignore small movements
        if (Math.abs(touchDiff) < TOUCH_THRESHOLD) return;
        
        // Don't handle touch navigation while smooth scrolling
        if (isNavigating) return;
        
        if (touchDiff > 0) {
            // Swipe down -> go up
            handleNavigation('up');
        } else {
            // Swipe up -> go down
            handleNavigation('down');
        }
        
        // Reset touch coordinates
        touchStartY = 0;
        touchEndY = 0;
    }, { passive: true });
}

// Initialize keyboard navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Only handle if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (window.DEBUG) console.log('Key pressed:', e.key);
        
        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                handleNavigation('down');
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                handleNavigation('up');
                break;
        }
    });
}

// Comment out initialization to test pure CSS behavior
// document.addEventListener('DOMContentLoaded', initNavigation);

// initNavigation(); 