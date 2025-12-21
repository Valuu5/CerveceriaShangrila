document.addEventListener('DOMContentLoaded', function() {

  // === 1. VARIABLES GLOBALES ===
  const menuToggle = document.getElementById('mobile-menu');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinksItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  // Elementos de Compra
  const btnBuy = document.getElementById('btn-buy'); // El botón de comprar
  const modal = document.getElementById('success-modal'); // La ventana emergente
  const btnCloseModal = document.getElementById('btn-close-modal'); // Botón cerrar del modal

  // === 2. VERIFICACIONES INICIALES ===
  checkLoginStatus();
  updateCartIcon();

  if (document.getElementById('cart-items-container')) {
    renderCart();
  }

  // === 3. EVENTO DEL BOTÓN COMPRAR (CONEXIÓN DIRECTA) ===
  if (btnBuy) {
    btnBuy.addEventListener('click', function(e) {
      e.preventDefault(); // Evita recargas raras

      // Verificamos de nuevo si hay carrito por seguridad
      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      if (carrito.length === 0) return;

      // 1. Mostrar la ventana modal
      if (modal) {
        modal.style.display = 'flex'; // La hacemos visible
        // Animación simple de entrada
        modal.style.opacity = '0';
        setTimeout(() => modal.style.opacity = '1', 10);
      } else {
        // Fallback por si borraste el HTML del modal sin querer
        alert("¡Pago Realizado! Gracias por tu compra.");
        finalizarCompra();
      }
    });
  }

  // === 4. EVENTO PARA CERRAR EL MODAL Y LIMPIAR TODO ===
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', finalizarCompra);
  }

  // Función auxiliar para borrar y redirigir
  function finalizarCompra() {
    if (modal) modal.style.display = 'none';
    localStorage.removeItem('carrito'); // Borramos carrito
    updateCartIcon(); // Actualizamos icono (se va el numero rojo)
    window.location.href = 'index.html'; // Nos fuimos al inicio
  }

  // === 5. AGREGAR AL CARRITO (Desde Index/Catalogo) ===
  const cartBtns = document.querySelectorAll('.btn-cart');
  cartBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!localStorage.getItem('usuarioActivo')) {
        alert("⚠️ Para agregar productos, primero debes iniciar sesión con tu cuenta.");
        return;
      }

      const card = this.closest('.product-card');
      // Lógica de extracción de datos...
      const titulo = card.querySelector('h3').innerText;
      const precio = parseInt(card.querySelector('.price').innerText.replace(/\D/g, ''));
      let imgUrl = card.querySelector('.card-image-box').style.backgroundImage.slice(5, -2).replace(/['"]/g, '');
      const itemImg = card.querySelector('img').getAttribute('src');

      const producto = { titulo, precio, fondo: imgUrl, img: itemImg, cantidad: 1, specs: '' };
      addToCart(producto);
    });
  });

  // === 6. LOGIN FORM ===
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

  // === 7. LOGOUT ===
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
        // Si estamos en carrito.html y no hay sesión, esto previene errores
        if(!window.location.href.includes('login.html')) {
          window.location.href = 'login.html';
        }
      }
    });
  }

  // === FUNCIONES AUXILIARES ===
  function checkLoginStatus() {
    if (localStorage.getItem('usuarioActivo')) {
      const userIcon = document.querySelector('.fa-user');
      if(userIcon) {
        userIcon.style.color = '#f3b13c';
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

  // === FUNCIÓN PARA AGREGAR AL CARRITO (Con Modal Bonito) ===
  function addToCart(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const existe = carrito.find(item => item.titulo === producto.titulo);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push(producto);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    // --- AQUÍ ESTÁ EL CAMBIO ---
    // 1. Actualizamos el icono del carrito
    updateCartIcon();

    // 2. Preparamos el mensaje personalizado
    const modal = document.getElementById('added-modal');
    const msg = document.getElementById('added-message');

    if (modal && msg) {
      msg.innerText = `Has agregado "${producto.titulo}" al carrito.`;
      modal.style.display = 'flex'; // ¡Aparece la ventana!

      // Animación pequeña
      modal.style.opacity = '0';
      setTimeout(() => modal.style.opacity = '1', 10);
    } else {
      // Plan B por si el HTML falla
      alert(`✅ ${producto.titulo} agregado al carrito.`);
    }
  }

  // === FUNCIÓN PARA CERRAR EL MODAL DE AGREGADO ===
  window.closeAddedModal = function() {
    const modal = document.getElementById('added-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  function renderCart() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');
    const btnBuy = document.getElementById('btn-buy');

    container.innerHTML = '';
    let total = 0;

    // Renderizado de items
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

    // CONTROL DEL BOTÓN DE COMPRA
    if (btnBuy) {
      if (carrito.length === 0) {
        btnBuy.disabled = true;
        btnBuy.innerText = "Tu carrito está vacío";
        container.innerHTML = '<p style="text-align:center; padding:20px;">No has agregado productos aún.</p>';
      } else {
        btnBuy.disabled = false;
        btnBuy.innerText = "Pagar Ahora";
        // NOTA: Ya no asignamos onclick aquí, lo hicimos arriba con addEventListener
      }
    }
  }

  // Funciones globales para el HTML onclick
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

  // Scroll Logic
  window.addEventListener('scroll', () => {
    // ... (Tu lógica de scroll existente) ...
  });
  // Menú Hamburguesa
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
    });
  }
});
