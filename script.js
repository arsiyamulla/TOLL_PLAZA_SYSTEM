// ========== GLOBAL VARIABLES ==========
let currentUser = null;
let allTransactions = [];
let tollRates = { Car: 65, SUV: 95, Truck: 150, Bike: 35 };

// ========== LOGIN PAGE FUNCTIONALITY ==========
if (document.querySelector('.login-container')) {
    // Role toggle functionality
    const roleBtns = document.querySelectorAll('.role-btn');
    let selectedRole = 'admin';
    
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            roleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedRole = this.dataset.role;
        });
    });

    // Toggle password visibility
    const toggleBtn = document.querySelector('.toggle-password');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Fill demo credentials
    document.querySelectorAll('.fill-demo').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('username').value = this.dataset.username;
            document.getElementById('password').value = this.dataset.password;
            const role = this.dataset.role;
            
            // Activate correct role button
            roleBtns.forEach(b => {
                if (b.dataset.role === role) {
                    b.click();
                }
            });
            
            showToast(`✓ ${role === 'admin' ? 'Admin' : 'Operator'} credentials filled!`, 'success');
        });
    });

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.querySelector('.role-btn.active').dataset.role;

            if (role === 'admin' && username === 'admin' && password === 'admin123') {
                const user = { username, role, loginTime: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(user));
                showToast('✓ Login successful! Redirecting to Admin Dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } 
            else if (role === 'operator' && username === 'operator' && password === 'oper123') {
                const user = { username, role, loginTime: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(user));
                showToast('✓ Login successful! Redirecting to Operator Panel...', 'success');
                setTimeout(() => {
                    window.location.href = 'operator.html';
                }, 1000);
            } 
            else {
                showToast('✗ Invalid credentials! Please check username and password.', 'error');
                // Shake animation
                const card = document.querySelector('.form-section');
                card.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    card.style.animation = '';
                }, 500);
            }
        });
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const icon = toast.querySelector('i');
    const msgSpan = document.getElementById('toastMsg');
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.style.background = '#28a745';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.style.background = '#dc3545';
    } else {
        icon.className = 'fas fa-info-circle';
        toast.style.background = '#17a2b8';
    }
    
    msgSpan.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== CHECK AUTH FOR OTHER PAGES ==========
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    return JSON.parse(user);
}

// ========== LOAD DATA ==========
function loadData() {
    const saved = localStorage.getItem('tollTransactions');
    if (saved) {
        allTransactions = JSON.parse(saved);
    } else {
        addDemoData();
    }
    
    const rates = localStorage.getItem('tollRates');
    if (rates) {
        tollRates = JSON.parse(rates);
    }
}

function addDemoData() {
    allTransactions = [];
    const vehicles = ['MH12AB1234', 'DL09CG5678', 'KA03XY9876', 'TN07ZZ1111', 'GJ01AA2222'];
    const payments = ['Credit Card', 'Debit Card', 'UPI', 'FastTag', 'Cash'];
    const types = ['Car', 'SUV', 'Truck', 'Bike'];
    
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        allTransactions.push({
            id: i + 1,
            vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
            vehicleType: types[Math.floor(Math.random() * types.length)],
            paymentMethod: payments[Math.floor(Math.random() * payments.length)],
            amount: Math.floor(Math.random() * 150) + 35,
            lane: Math.floor(Math.random() * 4) + 1,
            operator: 'Admin',
            timestamp: date.toISOString()
        });
    }
    saveData();
}

function saveData() {
    localStorage.setItem('tollTransactions', JSON.stringify(allTransactions));
}

// ========== ADMIN DASHBOARD ==========
if (document.querySelector('.admin-container')) {
    currentUser = checkAuth();
    if (currentUser && currentUser.role !== 'admin') {
        window.location.href = 'index.html';
    }
    
    loadData();
    updateAdminStats();
    initCharts();
    renderAdminTransactions();
    
    // Tab switching
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
        });
    });
    
    // Logout
    document.getElementById('adminLogout')?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Search and filter
    document.getElementById('adminSearch')?.addEventListener('input', renderAdminTransactions);
    document.getElementById('paymentFilter')?.addEventListener('change', renderAdminTransactions);
}

function updateAdminStats() {
    const today = new Date().toDateString();
    const todayTrans = allTransactions.filter(t => new Date(t.timestamp).toDateString() === today);
    const totalRevenue = allTransactions.reduce((s, t) => s + t.amount, 0);
    const fastagCount = todayTrans.filter(t => t.paymentMethod === 'FastTag').length;
    const fastagPercent = todayTrans.length ? ((fastagCount / todayTrans.length) * 100).toFixed(1) : 0;
    
    document.getElementById('todayRevenue').innerHTML = `₹${todayTrans.reduce((s, t) => s + t.amount, 0)}`;
    document.getElementById('todayVehicles').innerText = todayTrans.length;
    document.getElementById('fastagPercent').innerText = `${fastagPercent}%`;
    document.getElementById('totalRevenue').innerHTML = `₹${totalRevenue}`;
}

function initCharts() {
    const last7Days = [];
    const revenues = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        last7Days.push(dateStr.split(' ')[1] + ' ' + dateStr.split(' ')[2]);
        
        const dayRevenue = allTransactions
            .filter(t => new Date(t.timestamp).toDateString() === dateStr)
            .reduce((s, t) => s + t.amount, 0);
        revenues.push(dayRevenue);
    }
    
    const ctx1 = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: revenues,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    }
    
    const payments = {};
    allTransactions.forEach(t => {
        payments[t.paymentMethod] = (payments[t.paymentMethod] || 0) + 1;
    });
    
    const ctx2 = document.getElementById('paymentChart')?.getContext('2d');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: Object.keys(payments),
                datasets: [{
                    data: Object.values(payments),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
                }]
            }
        });
    }
}

function renderAdminTransactions() {
    const search = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('paymentFilter')?.value || '';
    
    const filtered = allTransactions.filter(t => {
        return t.vehicleNumber.toLowerCase().includes(search) && (!filter || t.paymentMethod === filter);
    });
    
    const tbody = document.getElementById('adminTransBody');
    if (tbody) {
        tbody.innerHTML = filtered.slice(0, 100).map(t => `
            <tr>
                <td>${t.id}</td>
                <td>${t.vehicleType}</td>
                <td>${t.vehicleNumber}</td>
                <td>${t.paymentMethod}</td>
                <td>₹${t.amount}</td>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
            </tr>
        `).join('');
    }
}

// Report functions
window.generateReport = function(period) {
    let filtered = [];
    const now = new Date();
    
    if (period === 'daily') {
        filtered = allTransactions.filter(t => new Date(t.timestamp).toDateString() === now.toDateString());
    } else if (period === 'weekly') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = allTransactions.filter(t => new Date(t.timestamp) >= weekAgo);
    } else {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = allTransactions.filter(t => new Date(t.timestamp) >= monthAgo);
    }
    
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    const avg = filtered.length ? (total / filtered.length).toFixed(2) : 0;
    
    document.getElementById('reportContent').innerHTML = `
        <div class="report-result">
            <h3>${period.toUpperCase()} Report</h3>
            <p><strong>Total Vehicles:</strong> ${filtered.length}</p>
            <p><strong>Total Revenue:</strong> ₹${total}</p>
            <p><strong>Average Toll:</strong> ₹${avg}</p>
            <p><strong>FastTag Users:</strong> ${filtered.filter(t => t.paymentMethod === 'FastTag').length}</p>
        </div>
    `;
};

window.exportData = function() {
    let csv = "ID,Vehicle Type,Vehicle Number,Payment Method,Amount,Lane,Operator,Time\n";
    allTransactions.forEach(t => {
        csv += `${t.id},${t.vehicleType},${t.vehicleNumber},${t.paymentMethod},${t.amount},${t.lane},${t.operator},${new Date(t.timestamp).toLocaleString()}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toll_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Data exported successfully!', 'success');
};

window.updateRates = function() {
    tollRates = {
        Car: parseInt(document.getElementById('carRate').value),
        SUV: parseInt(document.getElementById('suvRate').value),
        Truck: parseInt(document.getElementById('truckRate').value),
        Bike: parseInt(document.getElementById('bikeRate').value)
    };
    localStorage.setItem('tollRates', JSON.stringify(tollRates));
    showToast('✓ Toll rates updated successfully!', 'success');
};

// ========== OPERATOR PAGE ==========
if (document.querySelector('.operator-container')) {
    currentUser = checkAuth();
    if (currentUser && currentUser.role !== 'operator') {
        window.location.href = 'index.html';
    }
    
    if (currentUser) {
        document.getElementById('opName').innerHTML = `<i class="fas fa-user"></i> ${currentUser.username}`;
    }
    
    loadData();
    
    document.getElementById('operatorLogout')?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    document.getElementById('vehicleType')?.addEventListener('change', function() {
        const amount = tollRates[this.value];
        document.getElementById('totalAmount').innerText = amount;
    });
    
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePayment(btn.dataset.method));
    });
}

function handlePayment(method) {
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    if (!vehicleNumber) {
        showToast('Please enter vehicle number first!', 'error');
        return;
    }
    
    const amount = tollRates[document.getElementById('vehicleType').value];
    
    // Hide all panels
    document.getElementById('scannerContainer').style.display = 'none';
    document.getElementById('cashPanel').style.display = 'none';
    document.getElementById('fasttagPanel').style.display = 'none';
    document.getElementById('successPanel').style.display = 'none';
    
    if (method === 'Credit Card' || method === 'Debit Card') {
        document.getElementById('scannerTitle').innerHTML = '💳 Scanning Card...';
        document.getElementById('scannerContainer').style.display = 'block';
        setTimeout(() => completePayment(vehicleNumber, method, amount), 2500);
    } else if (method === 'UPI') {
        document.getElementById('scannerTitle').innerHTML = '📱 Scan UPI QR Code';
        document.getElementById('scannerContainer').style.display = 'block';
        setTimeout(() => completePayment(vehicleNumber, method, amount), 2500);
    } else if (method === 'FastTag') {
        document.getElementById('scannerTitle').innerHTML = '🏷️ FastTag Payment';
        document.getElementById('fasttagPanel').style.display = 'block';
        document.getElementById('ftVehicle').innerText = vehicleNumber;
        
        setTimeout(() => {
            document.getElementById('ftStatus').innerHTML = '✅ FastTag deducted successfully!';
            document.getElementById('processFasttag').style.display = 'block';
        }, 2000);
        
        document.getElementById('processFasttag').onclick = () => completePayment(vehicleNumber, method, amount);
    } else if (method === 'Cash') {
        document.getElementById('scannerTitle').innerHTML = '💵 Cash Payment';
        document.getElementById('cashPanel').style.display = 'block';
        
        document.getElementById('cashReceived').oninput = function() {
            const received = parseInt(this.value);
            const change = received - amount;
            const changeDiv = document.getElementById('changeDisplay');
            if (received >= amount) {
                changeDiv.innerHTML = `<div style="background:#d4edda; padding:10px; border-radius:8px;">💰 Change to return: ₹${change}</div>`;
            } else if (received > 0) {
                changeDiv.innerHTML = `<div style="background:#f8d7da; padding:10px; border-radius:8px;">⚠️ Need ₹${-change} more</div>`;
            } else {
                changeDiv.innerHTML = '';
            }
        };
        
        document.getElementById('processCash').onclick = () => {
            const received = parseInt(document.getElementById('cashReceived').value);
            if (received >= amount) {
                completePayment(vehicleNumber, method, amount);
            } else {
                showToast('Insufficient amount!', 'error');
            }
        };
    }
}

function completePayment(vehicleNumber, method, amount) {
    const newTrans = {
        id: allTransactions.length + 1,
        vehicleNumber: vehicleNumber.toUpperCase(),
        vehicleType: document.getElementById('vehicleType').value,
        paymentMethod: method,
        amount: amount,
        lane: document.getElementById('lane').value,
        operator: currentUser.username,
        timestamp: new Date().toISOString()
    };
    
    allTransactions.unshift(newTrans);
    saveData();
    
    // Show success
    document.getElementById('scannerContainer').style.display = 'none';
    document.getElementById('cashPanel').style.display = 'none';
    document.getElementById('fasttagPanel').style.display = 'none';
    document.getElementById('successPanel').style.display = 'block';
    document.getElementById('receiptId').innerText = newTrans.id;
    document.getElementById('paidAmount').innerText = amount;
    
    document.getElementById('newPayment').onclick = () => {
        document.getElementById('vehicleNumber').value = '';
        document.getElementById('vehicleType').value = 'Car';
        document.getElementById('lane').value = '1';
        document.getElementById('successPanel').style.display = 'none';
        document.getElementById('totalAmount').innerText = '65';
        showToast('Ready for next vehicle!', 'success');
    };
    
    showToast(`✓ Payment successful! Receipt #${newTrans.id}`, 'success');
}

document.getElementById('cancelScan')?.addEventListener('click', () => {
    document.getElementById('scannerContainer').style.display = 'none';
});