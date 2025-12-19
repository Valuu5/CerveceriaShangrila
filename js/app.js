// Esperamos a que todo el HTML cargue antes de ejecutar lógica
document.addEventListener('DOMContentLoaded', function() {

  // === PARTE 1: LÓGICA PARA EL INDEX (Verificar si ya entró) ===
  const botonLogin = document.querySelector('.btn-login');

  if (botonLogin) { // Si existe el botón (estamos en index o nosotros)
    const usuarioActivo = localStorage.getItem('usuarioLogueado');

    if (usuarioActivo === 'true') {
      const nombre = localStorage.getItem('nombreUsuario');
      botonLogin.textContent = 'Hola, ' + nombre + ' (Salir)';

      // Estilos para que parezca solo texto y no botón
      botonLogin.style.backgroundColor = 'transparent';
      botonLogin.style.border = '1px solid #fff';

      // Al hacer clic, cerramos sesión
      botonLogin.href = "#";
      botonLogin.onclick = function(e) {
        e.preventDefault();
        localStorage.clear(); // Borramos la memoria
        location.reload(); // Recargamos la página
      };
    }
  }

  // === PARTE 2: LÓGICA PARA EL LOGIN (El formulario) ===
  const formulario = document.getElementById('loginForm');

  if (formulario) { // Si existe el formulario (estamos en login.html)
    formulario.addEventListener('submit', function(e) {
      e.preventDefault(); // Evita recargar

      const usuario = document.getElementById('username').value;
      const clave = document.getElementById('password').value;
      const mensajeError = document.getElementById('mensajeError');

      // Validación (Usuario: admin, Clave: 1234)
      if (usuario === 'admin' && clave === '1234') {
        localStorage.setItem('usuarioLogueado', 'true');
        localStorage.setItem('nombreUsuario', usuario);
        window.location.href = 'index.html'; // Te manda al inicio
      } else {
        mensajeError.style.display = 'block'; // Muestra error
      }
    });
  }
});
