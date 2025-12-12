// GANTI DENGAN NOMOR WHATSAPP ANDA
const ADMIN_WHATSAPP_NUMBER = '6285785944924';

// Page Navigation
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active');
  });
  
  document.getElementById(pageId).classList.add('active');
}

// Show Order Modal
function showOrderModal(button) {
  const product = button.getAttribute('data-product');
  const price = button.getAttribute('data-price');
  
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