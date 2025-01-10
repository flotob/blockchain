import MarkdownIt from 'markdown-it';
import * as pdfjsLib from 'pdfjs-dist';
import Swiper from 'swiper';

// Export MarkdownIt to window object
window.markdownit = MarkdownIt;
// Export Swiper to window object
window.Swiper = Swiper;

export { MarkdownIt };
export { pdfjsLib };
export { Swiper }; 