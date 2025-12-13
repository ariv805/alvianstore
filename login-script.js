// GANTI PASSWORD ADMIN DI SINI
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// Fungsi untuk login
function handleLogin(event) {
  event.preventDefault();
  
  const userType = document.getElementById('userType').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (userType === 'admin') {
    // Cek kredensial admin
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const sessionData = {
        role: 'admin',
        username: username,
        loginTime: Date.now()
      };
      localStorage.setItem('alvianStoreSession', JSON.stringify(sessionData));
      window.location.href = 'admin.html';
    } else {
      alert('Username atau password admin salah!');
    }
  } else {
    // Cek kredensial user di localStorage
    const users = JSON.parse(localStorage.getItem('alvianStoreUsers')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const sessionData = {
        role: 'user',
        username: username,
        loginTime: Date.now()
      };
      localStorage.setItem('alvianStoreSession', JSON.stringify(sessionData));
      window.location.href = 'index.html';
    } else {
      alert('Username atau password salah! Belum punya akun? Silakan beli produk tanpa login.');
    }
  }
}

// Event listener untuk form login
document.getElementById('loginForm').addEventListener('submit', handleLogin);