// GANTI DENGAN NOMOR WHATSAPP ANDA
const ADMIN_WHATSAPP_NUMBER = '6285602095677'; 

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

// FUNGSI: Memulai timer cooldown
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

// FUNGSI: Mereset form di modal pemesanan
function resetOrderModal() {
    // Kosongkan input username dan password
    document.getElementById('panelUsername').value = '';
    document.getElementById('panelPassword').value = '';

    // Kembalikan pilihan metode pembayaran ke default
    document.getElementById('transferBank').checked = true;
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
    
    // Reset form setiap kali modal dibuka
    resetOrderModal();

    // Show modal
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();
}

// FUNGSI UTAMA: Dipanggil saat tombol "Lanjut ke WhatsApp" diklik
function processOrder() {
    const product = document.getElementById('modalProductName').textContent;
    const price = document.getElementById('modalProductPrice').textContent;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    let panelData = null;

    // Validasi data panel jika produknya adalah panel
    if (product.toLowerCase().includes('panel')) {
        const username = document.getElementById('panelUsername').value;
        const password = document.getElementById('panelPassword').value;

        if (!username || !password) {
            showNotification('Mohon isi username dan password panel!');
            return; // Hentikan proses jika data belum lengkap
        }
        
        // Simpan data panel ke variabel
        panelData = { username, password };
    }

    // 1. Simpan pesanan ke localStorage
    saveOrderToLocalStorage(product, price, paymentMethod, panelData);

    // 2. Tutup modal pemesanan
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    orderModal.hide();

    // 3. Tampilkan modal sukses
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // 4. Tunggu 3 detik, lalu redirect dan mulai cooldown
    setTimeout(() => {
        // Tutup modal sukses
        successModal.hide();

        // Mulai cooldown untuk mencegah spam
        startOrderCooldown();

        // Buat pesan WhatsApp
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

        // Encode pesan untuk URL
        const encodedMessage = encodeURIComponent(message);

        // Buat URL WhatsApp dan redirect
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
});
