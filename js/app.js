document.addEventListener('DOMContentLoaded', function() {

  // === 1. VARIABLES GLOBALES ===
  const menuToggle = document.getElementById('mobile-menu'); // El botón de las 3 rayitas
  const navLinksContainer = document.querySelector('.nav-links'); // La lista blanca que se despliega
  const navLinksItems = document.querySelectorAll('.nav-item'); // Cada uno de los enlaces (Inicio, Nosotros...)
  const sections = document.querySelectorAll('section'); // Las secciones de la página (para el scroll)

  // === 2. LÓGICA MENÚ HAMBURGUESA (Móvil) ===
  if (menuToggle) {
    // Al tocar el icono, abrimos/cerramos el menú
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
    });
  }

  // Al tocar un enlace, cerramos el menú automáticamente (para que veas la página)
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinksContainer.classList.contains('active')) {
        navLinksContainer.classList.remove('active');
      }
    });
  });

  // === 3. SCROLL SPY (Menú Inteligente) ===
  // Detecta en qué parte de la página estás para iluminar la pestaña correcta
  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      // Ajustamos -180 para compensar la altura de tu menú fijo
      if (window.scrollY >= (sectionTop - 180)) {
        current = section.getAttribute('id');
      }
    });

    navLinksItems.forEach(link => {
      link.classList.remove('active');
      // Si el link apunta al id actual (ej: href="#nosotros" y current="nosotros")
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

});
