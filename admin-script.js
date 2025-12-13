let allOrders = [];
let allTestimonials = [];

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
  const area = document.getElementById('notificationArea');
  const text = document.getElementById('notificationText');
  
  area.className = `alert alert-${type} alert-dismissible fade show`;
  text.textContent = message;
  area.style.display = 'block';
  
  setTimeout(() => {
    area.style.display = 'none';
  }, 5000);
}

// --- FUNGSI UNTUK PESANAN ---

function loadOrdersFromStorage() {
  const orders = localStorage.getItem('alvianStoreOrders');
  allOrders = orders ? JSON.parse(orders) : [];
}

function updateStats() {
  const totalSales = allOrders.length;
  const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
  
  const totalRevenue = allOrders
    .filter(o => o.status === 'success')
    .reduce((total, order) => total + parseInt(order.price), 0);
  
  document.getElementById('totalSales').textContent = totalSales;
  document.getElementById('totalRevenue').textContent = 'Rp ' + totalRevenue.toLocaleString('id-ID');
  document.getElementById('pendingOrders').textContent = pendingOrders;
  
  const badge = document.getElementById('pendingBadge');
  if (pendingOrders > 0) {
    badge.textContent = pendingOrders;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function displayOrders(ordersToDisplay) {
  const tableBody = document.getElementById('ordersTableBody');
  tableBody.innerHTML = '';
  
  if (ordersToDisplay.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada pesanan.</td></tr>';
    return;
  }
  
  ordersToDisplay.forEach(order => {
    let statusBadge = '';
    if (order.status === 'pending') {
      statusBadge = '<span class="badge bg-warning">Menunggu</span>';
    } else if (order.status === 'success') {
      statusBadge = '<span class="badge bg-success">Selesai</span>';
    } else {
      statusBadge = '<span class="badge bg-danger">Dibatalkan</span>';
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.product}</td>
            <td>Rp ${parseInt(order.price).toLocaleString('id-ID')}</td>
            <td>${order.paymentMethod}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
                ${order.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}', 'success')"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')"><i class="fas fa-times"></i></button>
                ` : ''}
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function filterOrders(status) {
  let filteredOrders = allOrders;
  if (status !== 'all') {
    filteredOrders = allOrders.filter(order => order.status === status);
  }
  displayOrders(filteredOrders);
}

function updateOrderStatus(orderId, newStatus) {
  const orderIndex = allOrders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    allOrders[orderIndex].status = newStatus;
    localStorage.setItem('alvianStoreOrders', JSON.stringify(allOrders));
    
    loadDashboard();
    
    if (newStatus === 'success') {
      showNotification(`Pesanan ${orderId} telah ditandai sebagai Selesai!`, 'success');
    } else {
      showNotification(`Pesanan ${orderId} telah dibatalkan.`, 'danger');
    }
  }
}

function showOrderDetails(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;
  
  document.getElementById('detailId').textContent = order.id;
  document.getElementById('detailProduct').textContent = order.product;
  document.getElementById('detailPrice').textContent = 'Rp ' + parseInt(order.price).toLocaleString('id-ID');
  document.getElementById('detailPayment').textContent = order.paymentMethod;
  
  const panelDataDiv = document.getElementById('detailPanelData');
  if (order.panelData) {
    document.getElementById('detailUsername').textContent = order.panelData.username;
    document.getElementById('detailPassword').textContent = order.panelData.password;
    panelDataDiv.style.display = 'block';
  } else {
    panelDataDiv.style.display = 'none';
  }
  
  const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
  modal.show();
}


// --- FUNGSI UNTUK TESTIMONI ---

function loadTestimonialsFromStorage() {
  const testimonials = localStorage.getItem('alvianStoreTestimonials');
  allTestimonials = testimonials ? JSON.parse(testimonials) : [];
}

function displayTestimonials() {
  const listContainer = document.getElementById('testimonialsList');
  listContainer.innerHTML = '';
  
  if (allTestimonials.length === 0) {
    listContainer.innerHTML = '<p class="text-center">Belum ada testimoni.</p>';
    return;
  }
  
  allTestimonials.forEach(testimonial => {
    const item = document.createElement('div');
    item.className = 'testimonial-item';
    item.innerHTML = `
            <img src="${testimonial.imageUrl}" alt="${testimonial.name}">
            <div class="testimonial-info">
                <h6>${testimonial.name}</h6>
                <p>${testimonial.text}</p>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${testimonial.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
    listContainer.appendChild(item);
  });
}

function addTestimonial(event) {
  event.preventDefault(); // Mencegah form reload
  
  const name = document.getElementById('testimonialName').value;
  const text = document.getElementById('testimonialText').value;
  const imageUrl = document.getElementById('testimonialImageUrl').value;
  
  if (!name || !text || !imageUrl) {
    alert('Semua field harus diisi!');
    return;
  }
  
  const newTestimonial = {
    id: 'testi-' + Date.now(),
    name: name,
    text: text,
    imageUrl: imageUrl
  };
  
  allTestimonials.push(newTestimonial);
  localStorage.setItem('alvianStoreTestimonials', JSON.stringify(allTestimonials));
  
  // Reset form
  document.getElementById('testimonialForm').reset();
  
  // Tampilkan notifikasi dan refresh daftar
  showNotification('Testimoni berhasil ditambahkan!', 'success');
  displayTestimonials();
}

function deleteTestimonial(testimonialId) {
  if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
    allTestimonials = allTestimonials.filter(t => t.id !== testimonialId);
    localStorage.setItem('alvianStoreTestimonials', JSON.stringify(allTestimonials));
    
    showNotification('Testimoni berhasil dihapus.', 'warning');
    displayTestimonials();
  }
}


// --- FUNGSI UTAMA DASHBOARD ---

function loadDashboard() {
  loadOrdersFromStorage();
  loadTestimonialsFromStorage();
  updateStats();
  displayOrders(allOrders);
  displayTestimonials();
}

// --- EVENT LISTENER ---

document.addEventListener('DOMContentLoaded', function() {
  loadDashboard();
  
  // Event listener untuk form testimoni
  document.getElementById('testimonialForm').addEventListener('submit', addTestimonial);
});