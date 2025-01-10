// Device detection
const isMobile = () => {
    const isMobileDevice = window.innerWidth <= 768 || 'ontouchstart' in window;
    console.log('[PDF Viewer] Device detection:', {
        width: window.innerWidth,
        hasTouch: 'ontouchstart' in window,
        isMobile: isMobileDevice
    });
    return isMobileDevice;
};

// Generate page image URL
function getPageImageUrl(pdfUrl, pageNum) {
    // Extract the PDF filename and directory
    const urlParts = pdfUrl.split('/');
    const pdfFilename = urlParts.pop(); // Get the filename
    const baseDir = urlParts.join('/'); // Get the directory path
    
    // Remove .pdf extension from filename
    const baseFilename = pdfFilename.replace('.pdf', '');
    
    // Construct the image URL with pages subdirectory
    return `${baseDir}/pages/${baseFilename}.${pageNum}.jpg`;
}

// Check if image exists
async function imageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`[PDF Viewer] Error checking image existence:`, error);
        return false;
    }
}

// Initialize Swiper for mobile PDF viewing
async function initMobileViewer(pdfContainer, pdfUrl) {
    if (!isMobile()) {
        console.log('[PDF Viewer] Not mobile, skipping mobile viewer');
        return null;
    }

    // First check if the first page exists
    const firstPageUrl = getPageImageUrl(pdfUrl, 1);
    console.log('[PDF Viewer] Checking first page:', firstPageUrl);
    const imageAvailable = await imageExists(firstPageUrl);

    if (!imageAvailable) {
        console.error('[PDF Viewer] No image version available, falling back to iframe');
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.title = 'PDF Document';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        pdfContainer.appendChild(iframe);
        return null;
    }

    // Create Swiper structure
    pdfContainer.innerHTML = `
        <div class="swiper">
            <div class="swiper-wrapper">
                <div class="swiper-slide">
                    <img src="${firstPageUrl}" alt="Page 1" loading="eager">
                </div>
            </div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
            <div class="swiper-progress">
                <div class="swiper-progress-bar"></div>
            </div>
        </div>
    `;

    const swiperEl = pdfContainer.querySelector('.swiper');
    const progressBar = swiperEl.querySelector('.swiper-progress-bar');

    try {
        console.log('[PDF Viewer] Initializing Swiper instance');
        
        const swiper = new window.Swiper(swiperEl, {
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            speed: 300,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'fraction',
                formatFractionCurrent: (number) => String(number).padStart(2, '0'),
                formatFractionTotal: (number) => String(number).padStart(2, '0'),
            },
            keyboard: {
                enabled: true,
            },
            on: {
                slideChange: function() {
                    // Update progress bar
                    const progress = (this.activeIndex) / (this.slides.length - 1);
                    progressBar.style.width = `${progress * 100}%`;
                },
                touchStart: function() {
                    // Show UI elements on touch
                    swiperEl.querySelector('.swiper-pagination').style.opacity = '1';
                    swiperEl.querySelector('.swiper-button-next').style.opacity = '1';
                    swiperEl.querySelector('.swiper-button-prev').style.opacity = '1';
                }
            }
        });

        // Load remaining pages in the background
        let pageNum = 2;
        const wrapper = swiperEl.querySelector('.swiper-wrapper');
        
        while (true) {
            const nextPageUrl = getPageImageUrl(pdfUrl, pageNum);
            console.log(`[PDF Viewer] Checking page ${pageNum}:`, nextPageUrl);
            const exists = await imageExists(nextPageUrl);
            if (!exists) break;

            wrapper.insertAdjacentHTML('beforeend', `
                <div class="swiper-slide">
                    <img src="${nextPageUrl}" alt="Page ${pageNum}" loading="lazy">
                </div>
            `);
            
            console.log(`[PDF Viewer] Added page ${pageNum}`);
            pageNum++;
            swiper.update();
            
            // Update progress bar for initial load
            const progress = (pageNum - 1) / (swiper.slides.length);
            progressBar.style.width = `${progress * 100}%`;
        }

        return swiper;
    } catch (error) {
        console.error('[PDF Viewer] Failed to initialize Swiper:', error);
        return null;
    }
}

// Main initialization function
export function initPdfViewer(containerId, pdfUrl, totalPages) {
    console.log('[PDF Viewer] Initializing viewer:', {
        containerId,
        pdfUrl,
        totalPages
    });

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('[PDF Viewer] Container not found:', containerId);
        return;
    }

    if (isMobile()) {
        initMobileViewer(container, pdfUrl);
    } else {
        console.log('[PDF Viewer] Using desktop iframe viewer');
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.title = 'PDF Document';
        container.appendChild(iframe);
    }
} 