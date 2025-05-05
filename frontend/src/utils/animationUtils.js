// Utility function to check if an element is in viewport
export const isElementInViewport = (el, offset = 0) => {
  if (!el) return false;
  
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - offset) &&
    rect.bottom >= 0
  );
};

// Add 'active' class to elements with 'reveal' class when they enter viewport
export const initScrollAnimations = () => {
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOnScroll = () => {
    for (let i = 0; i < revealElements.length; i++) {
      if (isElementInViewport(revealElements[i], 0.25)) {
        revealElements[i].classList.add('active');
      }
    }
  };
  
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);
  
  // Initial check
  revealOnScroll();
  
  return () => {
    window.removeEventListener('scroll', revealOnScroll);
    window.removeEventListener('load', revealOnScroll);
  };
};