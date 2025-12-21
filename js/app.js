document.addEventListener('DOMContentLoaded', function() {

  // ==========================================
  // 1. VARIABLES GLOBALES Y SELECTORES
  // ==========================================
  const menuToggle = document.getElementById('mobile-menu');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinksItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  // Botones y Elementos de Compra/Login
  const btnBuy = document.getElementById('btn-buy');
  const modalSuccess = document.getElementById('success-modal');
  const modalAdded = document.getElementById('added-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // ==========================================
  // 2. INICIALIZACIÓN (Al cargar la página)
  // ==========================================
  checkLoginStatus();
  updateCartIcon();

  // Si estamos en la página del carrito, renderizamos los items
  if (document.getElementById('cart-items-container')) {
    renderCart();
  }

  // ==========================================
  // 3. LÓGICA DE SCROLL SPY (Menú Inteligente)
  // ==========================================
  window.addEventListener('scroll', () => {
    let current = '';

    // A. Detectar sección normal
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      // Usamos -220 para que detecte el cambio justo cuando el título se acerca
      if (window.scrollY >= (sectionTop - 220)) {
        current = section.getAttribute('id');
      }
    });

    // B. Trampa para el final de la página (Contacto)
    // Si llegamos al fondo, forzamos que "contacto" sea el activo
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      current = 'contacto';
    }

    // C. Pintar la pestaña activa
    navLinksItems.forEach(link => {
      link.classList.remove('active');
      // Verificamos si el href del link coincide con la sección actual
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 4. LÓGICA DE LOGIN Y LOGOUT
  // ==========================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const user = document.getElementById('username').value;
      const pass = document.getElementById('password').value;

      if (user.toLowerCase() === 'profe' && pass === '123') {
        localStorage.setItem('usuarioActivo', 'profe');
        window.location.href = 'index.html';
      } else {
        document.getElementById('error-msg').style.display = 'block';
      }
    });
  }

  const userBtn = document.querySelector('.fa-user')?.parentElement;
  if (userBtn) {
    userBtn.addEventListener('click', function(e) {
      if (localStorage.getItem('usuarioActivo')) {
        e.preventDefault();
        if (confirm("¿Deseas cerrar sesión? Se vaciará tu carrito.")) {
          localStorage.removeItem('usuarioActivo');
          localStorage.removeItem('carrito');
          window.location.href = 'login.html';
        }
      } else {
        // Si no hay sesión, dejar que el link navegue al login
        if (!window.location.href.includes('login.html')) {
          // window.location.href = 'login.html'; // Opcional, el href del HTML ya lo hace
        }
      }
    });
  }

  // ==========================================
  // 5. AGREGAR AL CARRITO (Desde Index/Catalogo)
  // ==========================================
  const cartBtns = document.querySelectorAll('.btn-cart');
  cartBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();

      // Verificación de seguridad
      if (!localStorage.getItem('usuarioActivo')) {
        alert("⚠️ Para agregar productos, primero debes iniciar sesión.");
        return;
      }

      // Extraer datos del HTML
      const card = this.closest('.product-card');
      const titulo = card.querySelector('h3').innerText;
      const precio = parseInt(card.querySelector('.price').innerText.replace(/\D/g, ''));
      // Limpieza de URL de imagen
      let imgUrl = card.querySelector('.card-image-box').style.backgroundImage;
      imgUrl = imgUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      const itemImg = card.querySelector('img').getAttribute('src');

      const producto = { titulo, precio, fondo: imgUrl, img: itemImg, cantidad: 1, specs: '' };
      addToCart(producto);
    });
  });

  // ==========================================
  // 6. EVENTOS DE MODALES (Cerrar)
  // ==========================================
  // Botón para cerrar modal de compra exitosa
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', finalizarCompra);
  }

  // Función global para cerrar modal de "Agregado"
  window.closeAddedModal = function() {
    if (modalAdded) modalAdded.style.display = 'none';
  };

  // ==========================================
  // 7. MENÚ MÓVIL (Hamburguesa)
  // ==========================================
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
    });
  }
  // Cerrar menú al hacer click en un enlace
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinksContainer.classList.contains('active')) {
        navLinksContainer.classList.remove('active');
      }
    });
  });

  // ==========================================
  // 8. FUNCIONES AUXILIARES Y LÓGICA INTERNA
  // ==========================================

  function checkLoginStatus() {
    if (localStorage.getItem('usuarioActivo')) {
      const userIcon = document.querySelector('.fa-user');
      if (userIcon) {
        userIcon.style.color = '#f3b13c'; // Verde
        userIcon.closest('a').setAttribute('title', 'Cerrar Sesión');
      }
    }
  }

  function updateCartIcon() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const cartLink = document.querySelector('a[href="carrito.html"]');

    if (cartLink) {
      let badge = cartLink.querySelector('.cart-badge');
      if (totalItems > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.classList.add('cart-badge');
          cartLink.appendChild(badge);
        }
        badge.innerText = totalItems;
      } else {
        if (badge) badge.remove();
      }
    }
  }

  function addToCart(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carrito.find(item => item.titulo === producto.titulo);

    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push(producto);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCartIcon();

    // MOSTRAR MODAL "AGREGADO"
    const msg = document.getElementById('added-message');
    if (modalAdded && msg) {
      msg.innerText = `Has agregado "${producto.titulo}" al carrito.`;
      modalAdded.style.display = 'flex';
      // Animación simple
      modalAdded.style.opacity = '0';
      setTimeout(() => modalAdded.style.opacity = '1', 10);
    } else {
      // Fallback
      alert(`✅ ${producto.titulo} agregado al carrito.`);
    }
  }

  // BOTÓN COMPRAR EN CARRITO
  if (btnBuy) {
    btnBuy.addEventListener('click', function(e) {
      e.preventDefault();
      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      if (carrito.length === 0) return;

      if (modalSuccess) {
        modalSuccess.style.display = 'flex';
      } else {
        alert("¡Pago Realizado! Gracias por tu compra.");
        finalizarCompra();
      }
    });
  }

  function finalizarCompra() {
    if (modalSuccess) modalSuccess.style.display = 'none';
    localStorage.removeItem('carrito');
    updateCartIcon();
    window.location.href = 'index.html';
  }

  function renderCart() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');

    container.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
      total += (item.precio * item.cantidad);
      container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-img-box" style="background-image: url('${item.fondo}')"><img src="${item.img}"></div>
                    <div class="cart-details">
                        <h3>${item.titulo}</h3>
                        <p>Precio: $${item.precio.toLocaleString()}</p>
                        <textarea placeholder="Especificaciones..." onchange="updateSpecs(${index}, this.value)">${item.specs || ''}</textarea>
                    </div>
                    <div class="cart-actions">
                        <button class="btn-delete" onclick="removeItem(${index})">Borrar</button>
                        <div class="quantity-control">
                            <button onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.cantidad}</span>
                            <button onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>`;
    });

    if (totalElement) totalElement.innerText = total.toLocaleString();

    // Estado del botón comprar
    const btn = document.getElementById('btn-buy');
    if (btn) {
      if (carrito.length === 0) {
        btn.disabled = true;
        btn.innerText = "Tu carrito está vacío";
        container.innerHTML = '<p style="text-align:center; padding:20px;">No has agregado productos aún.</p>';
      } else {
        btn.disabled = false;
        btn.innerText = "Pagar Ahora";
      }
    }
  }

  // FUNCIONES GLOBALES (Para onclicks en HTML)
  window.removeItem = (index) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCart();
    updateCartIcon();
  };
  window.changeQty = (index, delta) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCart();
    updateCartIcon();
  };
  window.updateSpecs = (index, val) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito[index].specs = val;
    localStorage.setItem('carrito', JSON.stringify(carrito));
  };

});
