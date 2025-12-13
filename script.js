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

    // --- TAMBAHKAN BARIS INI ---
    // Untuk menutup navbar di mobile setelah link diklik
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        const bsCollapse = new bootstrap.Collapse(navbarNav, {
            toggle: false
        });
        bsCollapse.hide();
    }
    // --- SELESAI ---
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
    const priceRaw = button.getAttribute('data-price'); // Harga mentah (ex: "1000")

    // Simpan teks asli tombol jika belum disimpan
    if (!button.getAttribute('data-original-text')) {
        button.setAttribute('data-original-text', button.innerHTML);
    }

    // Set product info in modal
    document.getElementById('modalProductName').textContent = product;
    // Tampilkan harga yang sudah diformat
    document.getElementById('modalProductPrice').textContent = 'Rp ' + parseInt(priceRaw).toLocaleString('id-ID');

    // --- PERBAIKAN KRUSIAL ---
    // Simpan harga mentah sebagai atribut di modal agar bisa diambil lagi nanti
    const orderModal = document.getElementById('orderModal');
    orderModal.setAttribute('data-current-price-raw', priceRaw);

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
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

// FUNGSI UTAMA: Dipanggil saat tombol "Lanjut ke WhatsApp" diklik
// FUNGSI UTAMA: Dipanggil saat tombol "Lanjut ke WhatsApp" diklik
function processOrder() {
    const product = document.getElementById('modalProductName').textContent;
    
    // --- PERBAIKAN KRUSIAL ---
    // Ambil harga mentah yang sudah kita simpan di atribut modal
    const priceRaw = document.getElementById('orderModal').getAttribute('data-current-price-raw');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    let message = `Halo Kak, saya ingin membeli produk berikut:\n\n`;
    message += `*Produk:* ${product}\n`;
    // Gunakan harga mentah untuk format pesan WhatsApp
    message += `*Harga:* Rp ${parseInt(priceRaw).toLocaleString('id-ID')}\n`;

    let panelData = null;

    // Validasi data panel jika produknya adalah panel
    if (product.toLowerCase().includes('panel')) {
        const username = document.getElementById('panelUsername').value;
        const password = document.getElementById('panelPassword').value;

        if (!username || !password) {
            showNotification('Mohon isi username dan password panel!');
            return; // Hentikan proses jika data belum lengkap
        }
        message += `\n*Data Panel:*\n`;
        message += `Username: ${username}\n`;
        message += `Password: ${password}\n`;
        
        panelData = { username, password };
    }
    message += `\nSaya akan membayar melalui: *${paymentMethod}*\n`;
        message += `\nMohon info rekening atau QRIS untuk pembayaran. Terima kasih!`;
    
    // --- PERBAIKAN KRUSIAL ---
    // Simpan pesanan ke localStorage menggunakan harga MENTAH
    saveOrderToLocalStorage(product, priceRaw, paymentMethod, panelData);

    // Tutup modal pemesanan
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    orderModal.hide();

    // Tampilkan modal sukses
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // Tunggu 3 detik, lalu redirect dan mulai cooldown
    setTimeout(() => {
        successModal.hide();
        startOrderCooldown();

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
