// GANTI DENGAN NOMOR WHATSAPP ANDA
const ADMIN_WHATSAPP_NUMBER = '628123456789'; 

// DURASI WAKTU TUNGGU (dalam detik) -> 60 MENIT = 3600 DETIK
const ORDER_COOLDOWN_SECONDS = 3600; 

// Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
}

// FUNGSI: Menyimpan pesanan ke localStorage
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

// FUNGSI UTAMA: Memulai timer cooldown
function startOrderCooldown(duration = ORDER_COOLDOWN_SECONDS) {
    const orderButtons = document.querySelectorAll('.btn-order');
    
    // Nonaktifkan semua tombol dan ubah teksnya
    orderButtons.forEach(button => {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mohon Tunggu...';
    });

    // Simpan waktu cooldown dimulai
    localStorage.setItem('lastOrderTime', Date.now());

    // Set timer untuk mengaktifkan kembali tombol
    setTimeout(() => {
        orderButtons.forEach(button => {
            button.disabled = false;
            // Kembalikan teks tombol ke aslinya
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
        });
        // Hapus waktu cooldown dari localStorage setelah selesai
        localStorage.removeItem('lastOrderTime');
    }, duration * 1000); // 1000 milidetik = 1 detik
}

// FUNGSI: Mengecek cooldown saat halaman dimuat
function checkInitialCooldown() {
    const lastOrderTime = localStorage.getItem('lastOrderTime');
    if (lastOrderTime) {
        const timePassed = (Date.now() - parseInt(lastOrderTime)) / 1000; // dalam detik
        const remainingTime = ORDER_COOLDOWN_SECONDS - timePassed;

        if (remainingTime > 0) {
            // Jika masih dalam periode cooldown, mulai cooldown dengan sisa waktu
            startOrderCooldown(remainingTime);
        }
    }
}

// FUNGSI: Mereset form di modal pemesanan
function resetOrderModal() {
    document.getElementById('panelUsername').value = '';
    document.getElementById('panelPassword').value = '';
    document.getElementById('transferBank').checked = true;
}

// Show Order Modal
function showOrderModal(button) {
    const product = button.getAttribute('data-product');
    const price = button.getAttribute('data-price');

    if (!button.getAttribute('data-original-text')) {
        button.setAttribute('data-original-text', button.innerHTML);
    }

    document.getElementById('modalProductName').textContent = product;
    document.getElementById('modalProductPrice').textContent = 'Rp ' + parseInt(price).toLocaleString('id-ID');

    const panelDataFields = document.getElementById('panelDataFields');
    if (product.toLowerCase().includes('panel')) {
        panelDataFields.style.display = 'block';
    } else {
        panelDataFields.style.display = 'none';
    }
    
    resetOrderModal();

    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();
}

// FUNGSI UTAMA: Dipanggil saat tombol "Lanjut ke WhatsApp" diklik
function processOrder() {
    const product = document.getElementById('modalProductName').textContent;
    const price = document.getElementById('modalProductPrice').textContent;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    let panelData = null;

    if (product.toLowerCase().includes('panel')) {
        const username = document.getElementById('panelUsername').value;
        const password = document.getElementById('panelPassword').value;

        if (!username || !password) {
            showNotification('Mohon isi username dan password panel!');
            return;
        }
        
        panelData = { username, password };
    }

    // Simpan pesanan ke localStorage
    saveOrderToLocalStorage(product, price, paymentMethod, panelData);

    // Tutup modal pemesanan
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    orderModal.hide();

    // Tampilkan modal sukses
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // Mulai cooldown SEBELUM redirect
    startOrderCooldown();

    // Tunggu 3 detik, lalu redirect
    setTimeout(() => {
        successModal.hide();

        let message = `Halo Kak, saya ingin membeli produk berikut:\n\n`;
        message += `*Produk:* ${product}\n`;
        message += `*Harga:* ${price}\n`;
        
        if (panelData) {
            message += `\n*Data Panel:*\n`;
            message += `Username: ${panelData.username}\n`;
            message += `Password: ${panelData.password}\n`;
        }

        message += `\nSaya akan membayar melalui: *${paymentMethod}*\n`;
        message += `\nMohon info rekening atau QRIS untuk pembayaran. Terima kasih!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;
        window.location.href = whatsappURL;

    }, 3000); // Tunggu 3 detik
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
    // PENTING: Panggil fungsi untuk mengecek cooldown awal
    checkInitialCooldown();
});
