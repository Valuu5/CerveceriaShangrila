document.addEventListener('DOMContentLoaded', function() {
  console.log('Sistema de transiciones listo');

  // Seleccionamos todos los enlaces de la página (etiquetas <a>)
  const links = document.querySelectorAll('a');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const destino = this.href;

      // Verificamos que sea un link interno real (que lleve a otro HTML)
      // y que no sea solo un "#" o un link externo que abra en otra pestaña
      if (destino.includes(window.location.origin) && !destino.includes('#') && this.target !== '_blank') {

        e.preventDefault(); // ¡Alto ahí! No cambies de página todavía.

        // 1. Añadimos la clase que hace que el cuerpo se desvanezca
        document.body.classList.add('fading-out');

        // 2. Esperamos 500ms (lo mismo que dura la transición CSS)
        setTimeout(function() {
          window.location.href = destino; // Ahora sí, vete a la nueva página.
        }, 500);
      }
    });
  });

  if (document.querySelector('.about-section')) {
    console.log('Estás en la sección Quiénes Somos');
  } else {
    console.log('Estás en el Inicio');
  }
});
