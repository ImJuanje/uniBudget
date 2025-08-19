// ===== Scroll suave para enlaces internos =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  
      // Si es menú móvil, cerrarlo al hacer clic en enlace
      const navLinks = document.querySelector('.lb-links');
      if(navLinks.classList.contains('active')){
        navLinks.classList.remove('active');
      }
    });
  });
  
  // ===== Animaciones de entrada al hacer scroll =====
  const scrollElements = document.querySelectorAll('.animate-on-scroll');
  
  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
  };
  
  const displayScrollElement = (element) => {
    element.classList.add('scrolled');
  };
  
  const hideScrollElement = (element) => {
    element.classList.remove('scrolled');
  };
  
  const handleScrollAnimation = () => {
    scrollElements.forEach(el => {
      if(elementInView(el, 1.25)){
        displayScrollElement(el);
      } else {
        hideScrollElement(el);
      }
    });
  };
  
  window.addEventListener('scroll', handleScrollAnimation);
  
  // ===== Botón volver arriba =====
  const backToTopBtn = document.createElement('button');
  backToTopBtn.textContent = '↑';
  backToTopBtn.id = 'backToTop';
  document.body.appendChild(backToTopBtn);
  
  Object.assign(backToTopBtn.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    border: 'none',
    background: '#4f46e5',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0,0,0,.2)',
    opacity: '0',
    transition: 'opacity .3s ease',
  });
  
  window.addEventListener('scroll', () => {
    if(window.scrollY > 300){
      backToTopBtn.style.opacity = '1';
    } else {
      backToTopBtn.style.opacity = '0';
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // ===== Menú hamburguesa =====
  document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.lb-links');
  
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
      });
    }
  });
  