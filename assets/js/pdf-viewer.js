// Device detection
const isMobile = () => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
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
    } catch {
        return false;
    }
}

// Create slide HTML with orientation detection
function createSlideHTML(imageUrl, pageNum, isFirst = false) {
    return `
        <div class="swiper-slide">
            <img 
                src="${imageUrl}" 
                alt="Page ${pageNum}" 
                loading="${isFirst ? 'eager' : 'lazy'}"
                onload="(function(img) {
                    const slide = img.parentElement;
                    if (img.naturalWidth > img.naturalHeight) {
                        slide.classList.add('landscape');
                    } else {
                        slide.classList.add('portrait');
                    }
                    if (typeof window.updateSwiper === 'function') {
                        window.updateSwiper();
                    }
                })(this)"
            >
        </div>
    `;
}

// Initialize Swiper for mobile PDF viewing
async function initMobileViewer(pdfContainer, pdfUrl) {
    if (!isMobile()) return null;

    // First check if the first page exists
    const firstPageUrl = getPageImageUrl(pdfUrl, 1);
    const imageAvailable = await imageExists(firstPageUrl);

    if (!imageAvailable) {
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
                ${createSlideHTML(firstPageUrl, 1, true)}
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
                    const progress = (this.activeIndex) / (this.slides.length - 1);
                    progressBar.style.width = `${progress * 100}%`;
                },
                touchStart: function() {
                    swiperEl.querySelector('.swiper-pagination').style.opacity = '1';
                    swiperEl.querySelector('.swiper-button-next').style.opacity = '1';
                    swiperEl.querySelector('.swiper-button-prev').style.opacity = '1';
                }
            }
        });

        // Add global update function for image onload
        window.updateSwiper = () => swiper.update();

        // Load remaining pages in the background
        let pageNum = 2;
        const wrapper = swiperEl.querySelector('.swiper-wrapper');
        
        while (true) {
            const nextPageUrl = getPageImageUrl(pdfUrl, pageNum);
            const exists = await imageExists(nextPageUrl);
            if (!exists) break;

            wrapper.insertAdjacentHTML('beforeend', createSlideHTML(nextPageUrl, pageNum));
            pageNum++;
            swiper.update();
            
            // Update progress bar for initial load
            const progress = (pageNum - 1) / (swiper.slides.length);
            progressBar.style.width = `${progress * 100}%`;
        }

        return swiper;
    } catch {
        return null;
    }
}

// Main initialization function
export function initPdfViewer(containerId, pdfUrl, totalPages) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (isMobile()) {
        initMobileViewer(container, pdfUrl);
    } else {
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.title = 'PDF Document';
        container.appendChild(iframe);
    }
} 