document.addEventListener('DOMContentLoaded', function() {

  // === 1. VARIABLES GLOBALES ===
  const menuToggle = document.getElementById('mobile-menu');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinksItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  // Variables de Usuario y Carrito
  const userBtn = document.querySelector('.fa-user')?.parentElement; // El icono de usuario
  const cartBtns = document.querySelectorAll('.btn-cart'); // Botones de comprar
  const loginForm = document.getElementById('loginForm'); // Formulario de login
  const cartContainer = document.getElementById('cart-items-container'); // Donde se ven los items en carrito.html

  // === 2. VERIFICAR SESIÓN AL CARGAR ===
  checkLoginStatus();
  updateCartIcon();

  // === 3. LÓGICA DE INICIO DE SESIÓN (LOGIN) ===
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const user = document.getElementById('username').value;
      const pass = document.getElementById('password').value;

      // VALIDACIÓN: Usuario "profe" y contraseña "123"
      if (user.toLowerCase() === 'profe' && pass === '123') {
        // Guardamos en memoria que está logueado
        localStorage.setItem('usuarioActivo', 'profe');
        // Redirigimos al inicio
        window.location.href = 'index.html';
      } else {
        // Mostrar error
        document.getElementById('error-msg').style.display = 'block';
      }
    });
  }

  // === 4. LÓGICA DE CERRAR SESIÓN (LOGOUT) ===
  if (userBtn) {
    userBtn.addEventListener('click', function(e) {
      // Si ya hay usuario, el botón funciona como Logout
      if (localStorage.getItem('usuarioActivo')) {
        e.preventDefault();
        let confirmar = confirm("¿Deseas cerrar sesión? Se vaciará tu carrito.");
        if (confirmar) {
          localStorage.removeItem('usuarioActivo');
          localStorage.removeItem('carrito'); // Borra el carrito al salir
          window.location.href = 'login.html'; // Manda al login
        }
      } else {
        // Si no hay usuario, te lleva al login (comportamiento normal del link)
        window.location.href = 'login.html';
      }
    });
  }

  // === 5. AGREGAR AL CARRITO (Desde Index) ===
  cartBtns.forEach(btn => {
    // Agregamos 'e' dentro de los paréntesis para controlar el evento
    btn.addEventListener('click', function(e) {

      // 1. Freno de mano: Evitamos que el botón recargue la página o haga cosas raras
      e.preventDefault();

      // 2. Verificar si está logueado
      if (!localStorage.getItem('usuarioActivo')) {
        // Solo mostramos el mensaje
        alert("⚠️ Para agregar productos, primero debes iniciar sesión con tu cuenta.");

        // Y aquí matamos la función. NO redirigimos, NO hacemos nada más.
        // La página se queda tal cual, sin errores de CSS ni pantallazos blancos.
        return;
      }

      // --- Si pasa la validación, recién aquí ejecuta la lógica de compra ---

      // 3. Obtener datos del producto (navegamos por el HTML para encontrar info)
      const card = this.closest('.product-card');
      const titulo = card.querySelector('h3').innerText;
      const precioTexto = card.querySelector('.price').innerText;
      const precio = parseInt(precioTexto.replace(/\D/g, '')); // Saca solo el número

      // Limpiamos la url de la imagen de fondo para que no queden comillas raras
      let imgUrl = card.querySelector('.card-image-box').style.backgroundImage;
      imgUrl = imgUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');

      const itemImg = card.querySelector('img').getAttribute('src');

      // 4. Crear objeto producto
      const producto = {
        titulo: titulo,
        precio: precio,
        fondo: imgUrl,
        img: itemImg,
        cantidad: 1,
        specs: ''
      };

      // 5. Guardar en LocalStorage
      addToCart(producto);
    });
  });

  // === 6. RENDERIZAR CARRITO (Solo en carrito.html) ===
  if (cartContainer) {
    renderCart();
  }

  // === FUNCIONES AUXILIARES ===

  function checkLoginStatus() {
    const isLogged = localStorage.getItem('usuarioActivo');
    const userIcon = document.querySelector('.fa-user');

    if (isLogged && userIcon) {
      // Si está logueado, cambiamos el icono a uno de "Salida" o lo ponemos verde
      userIcon.style.color = '#f3b13c'; // Verde para indicar activo
      userIcon.title = "Cerrar Sesión";
    }
  }

  function addToCart(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificar si ya existe para sumar cantidad
    const existe = carrito.find(item => item.titulo === producto.titulo);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push(producto);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`✅ ${producto.titulo} agregado al carrito.`);

    updateCartIcon(); // <--- 2. AQUÍ (Para que se actualice al comprar)
  }

  function renderCart() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');

    container.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
      container.innerHTML = '<p style="text-align:center;">Tu carrito está vacío.</p>';
      totalElement.innerText = '0';
      return;
    }

    carrito.forEach((item, index) => {
      total += (item.precio * item.cantidad);

      // Creamos el HTML de cada item dinámicamente
      const itemHTML = `
                <div class="cart-item">
                    <div class="cart-img-box" style="background-image: url('${item.fondo}')">
                        <img src="${item.img}" alt="${item.titulo}">
                    </div>

                    <div class="cart-details">
                        <h3>${item.titulo}</h3>
                        <p>Precio: $${item.precio.toLocaleString()}</p>

                        <label>Especificaciones:</label>
                        <textarea placeholder="Ej: Talla L, Sin alcohol..." onchange="updateSpecs(${index}, this.value)">${item.specs || ''}</textarea>
                    </div>

                    <div class="cart-actions">
                        <button class="btn-delete" onclick="removeItem(${index})">Borrar</button>

                        <div class="quantity-control">
                            <button onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.cantidad} unidad${item.cantidad > 1 ? 'es' : ''}</span>
                            <button onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
      container.innerHTML += itemHTML;
    });

    totalElement.innerText = total.toLocaleString();
  }

  function updateCartIcon() {
    // 1. Buscamos el carrito en memoria
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 2. Sumamos la cantidad de TODOS los productos (no solo el largo del array)
    // Ej: Si llevas 2 packs de 6, la suma debe ser 2 (o 12 si cuentas cervezas, aquí contamos items agregados)
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    // 3. Buscamos el enlace del carrito en el HTML
    // (Buscamos el <a> que tiene el href="carrito.html")
    const cartLink = document.querySelector('a[href="carrito.html"]');

    if (cartLink) {
      // Buscamos si ya existe el circulito
      let badge = cartLink.querySelector('.cart-badge');

      if (totalItems > 0) {
        // Si hay cosas, mostramos el número
        if (!badge) {
          // Si no existe, lo creamos
          badge = document.createElement('span');
          badge.classList.add('cart-badge');
          cartLink.appendChild(badge);
        }
        // Actualizamos el número
        badge.innerText = totalItems;
      } else {
        // Si está vacío (0), borramos el circulito para que no moleste
        if (badge) {
          badge.remove();
        }
      }
    }
  }
  // === FUNCIONES GLOBALES (Para que funcionen los onclick del HTML) ===
  window.removeItem = function(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCart();

    updateCartIcon(); // <--- 3. AQUÍ (Si borras algo desde el carrito)
  };

  window.changeQty = function(index, delta) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito[index].cantidad += delta;

    if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;

    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCart();

    updateCartIcon(); // <--- 4. AQUÍ (Si subes o bajas cantidades)
  };

  window.updateSpecs = function(index, text) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito[index].specs = text;
    localStorage.setItem('carrito', JSON.stringify(carrito));
  };

  // === MANTENEMOS LÓGICA DE MENÚ Y SCROLL (Tu código anterior) ===
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
    });
  }
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinksContainer && navLinksContainer.classList.contains('active')) {
        navLinksContainer.classList.remove('active');
      }
    });
  });
  // === 3. SCROLL SPY (Ajustado para Productos) ===
  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;

      // === AQUÍ ESTÁ EL CAMBIO ===
      // Antes tenías -180. Lo cambiamos a -250.
      // Esto hace que la pestaña se active "antes" de que el título toque el menú negro.
      // Traducción: Detecta la sección cuando entra al tercio superior de la pantalla.
      if (window.scrollY >= (sectionTop - 250)) {
        current = section.getAttribute('id');
      }
    });

    // TRAMPA FINAL (Mantenla para que Contactanos siga funcionando bien)
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
      current = 'contacto';
    }

    // Pintamos la pestaña correcta
    navLinksItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

});
