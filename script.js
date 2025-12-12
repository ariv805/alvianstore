// GANTI DENGAN NOMOR WHATSAPP ANDA
const ADMIN_WHATSAPP_NUMBER = '628123456789'; 

// DURASI WAKTU TUNGGU (dalam detik)
const ORDER_COOLDOWN_SECONDS = 60; 

// Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
}

// FUNGSI BARU: Menyimpan pesanan ke localStorage
function saveOrderToLocalStorage(product, price, paymentMethod, panelData) {
    const orderId = 'ORD-' + Date.now();
    const newOrder = {
        id: orderId,
        product: product,
        price: price,
        paymentMethod: paymentMethod,
        panelData: panelData,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    let orders = JSON.parse(localStorage.getItem('alvianStoreOrders')) || [];
    orders.push(newOrder);
    localStorage.setItem('alvianStoreOrders', JSON.stringify(orders));
}

// FUNGSI BARU: Memulai timer cooldown
function startOrderCooldown() {
    const orderButtons = document.querySelectorAll('.btn-order');
    
    // Nonaktifkan semua tombol dan ubah teksnya
    orderButtons.forEach(button => {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mohon Tunggu...';
    });

    // Set timer untuk mengaktifkan kembali tombol setelah beberapa detik
    setTimeout(() => {
        orderButtons.forEach(button => {
            button.disabled = false;
            // Kembalikan teks tombol ke aslinya
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
        });
    }, ORDER_COOLDOWN_SECONDS * 1000); // 1000 milidetik = 1 detik
}


// Show Order Modal
function showOrderModal(button) {
    const product = button.getAttribute('data-product');
    const price = button.getAttribute('data-price');

    // Simpan teks asli tombol jika belum disimpan
    if (!button.getAttribute('data-original-text')) {
        button.setAttribute('data-original-text', button.innerHTML);
    }

    // Set product info in modal
    document.getElementById('modalProductName').textContent = product;
    document.getElementById('modalProductPrice').textContent = 'Rp ' + parseInt(price).toLocaleString('id-ID');

    // Show/hide panel data fields
    const panelDataFields = document.getElementById('panelDataFields');
    if (product.toLowerCase().includes('panel')) {
        panelDataFields.style.display = 'block';
    } else {
        panelDataFields.style.display = 'none';
    }
    
    // Show modal
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();
}

// Redirect to WhatsApp
function redirectToWhatsApp() {
    const product = document.getElementById('modalProductName').textContent;
    const price = document.getElementById('modalProductPrice').textContent;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    let message = `Halo Kak, saya ingin membeli produk berikut:\n\n`;
    message += `*Produk:* ${product}\n`;
    message += `*Harga:* ${price}\n`;

    let panelData = null;

    // Add panel data if it's a panel product
    if (product.toLowerCase().includes('panel')) {
        const username = document.getElementById('panelUsername').value;
        const password = document.getElementById('panelPassword').value;

        if (!username || !password) {
            showNotification('Mohon isi username dan password panel!');
            return; // Stop the function
        }
        message += `\n*Data Panel:*\n`;
        message += `Username: ${username}\n`;
        message += `Password: ${password}\n`;
        
        panelData = { username, password };
    }

    // Simpan pesanan ke localStorage
    saveOrderToLocalStorage(product, price, paymentMethod, panelData);

    // Mulai cooldown untuk mencegah spam
    startOrderCooldown();

    message += `\nSaya akan membayar melalui: *${paymentMethod}*\n`;
    message += `\nMohon info rekening atau QRIS untuk pembayaran. Terima kasih!`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Redirect to WhatsApp
    window.location.href = whatsappURL;
}

// Show Notification
function showNotification(messageText) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = messageText;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
});function redirectToWhatsApp() {
  const product = document.getElementById('modalProductName').textContent;
  const price = document.getElementById('modalProductPrice').textContent;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  let message = `Halo Kak, saya ingin membeli produk berikut:\n\n`;
  message += `*Produk:* ${product}\n`;
  message += `*Harga:* ${price}\n`;
  
  // Add panel data if it's a panel product
  if (product.toLowerCase().includes('panel')) {
    const username = document.getElementById('panelUsername').value;
    const password = document.getElementById('panelPassword').value;
    
    if (!username || !password) {
      showNotification('Mohon isi username dan password panel!');
      return; // Stop the function
    }
    message += `\n*Data Panel:*\n`;
    message += `Username: ${username}\n`;
    message += `Password: ${password}\n`;
  }
  
  message += `\nSaya akan membayar melalui: *${paymentMethod}*\n`;
  message += `\nMohon info rekening atau QRIS untuk pembayaran. Terima kasih!`;
  
  // Encode the message for the URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create the WhatsApp URL
  const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  // Redirect to WhatsApp
  window.location.href = whatsappURL;
}

// Show Notification
function showNotification(messageText) {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notificationText');
  
  notificationText.textContent = messageText;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  showPage('home');
});
