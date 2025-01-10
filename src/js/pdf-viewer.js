// Device detection
const isMobile = () => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
};

// Initialize Swiper for mobile PDF viewing
function initMobileViewer(pdfContainer, pages) {
    if (!isMobile()) return null;

    // Create Swiper container
    const swiperContainer = document.createElement('div');
    swiperContainer.className = 'swiper';
    
    // Create Swiper wrapper
    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';
    
    // Add slides for each page
    pages.forEach((page, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        const img = document.createElement('img');
        img.src = page;
        img.alt = `Page ${index + 1}`;
        img.loading = 'lazy';
        slide.appendChild(img);
        swiperWrapper.appendChild(slide);
    });
    
    // Add pagination
    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination';
    
    // Assemble Swiper structure
    swiperContainer.appendChild(swiperWrapper);
    swiperContainer.appendChild(pagination);
    
    // Replace PDF iframe with Swiper
    pdfContainer.innerHTML = '';
    pdfContainer.appendChild(swiperContainer);
    
    // Initialize Swiper
    return new Swiper('.swiper', {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 30,
        mousewheel: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        keyboard: {
            enabled: true
        },
        lazy: {
            loadPrevNext: true,
            loadPrevNextAmount: 2
        }
    });
}

// Main initialization function
export function initPdfViewer(containerId, pdfUrl, totalPages) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (isMobile()) {
        // Generate array of page image URLs
        const pages = Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            return pdfUrl.replace('.pdf', `.${pageNum}.jpg`);
        });
        
        initMobileViewer(container, pages);
    } else {
        // Keep existing iframe for desktop
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.title = 'PDF Document';
        container.appendChild(iframe);
    }
} 