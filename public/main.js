// ==================== CONSTANTES ====================
const api_url = 'http://localhost:3000/api';
let selected_vehicle_type = 'carro';
let found_vehicle = null;

// ==================== TEMPLATES HTML ====================
const templates = {
    home: `
<div class="screen">
  <div class="header">
    <div></div>
    <div class="logo">park<span>easy</span></div>
    <div class="menu-btn"><img src="Images/home.png" alt="home"></div>
  </div>
  <div style="padding: 20px 0">
    <div class="menu-logo"><img src="Images/Logo.png"></div>
    <h1 class="title title-center">bienvenido a<br>park easy</h1>
    <div class="login-card">
      <div class="input-group">
        <label class="input-label">usuario</label>
        <input type="text" class="text-field" placeholder="usuario" id="login-user">
      </div>
      <div class="input-group">
        <label class="input-label">contraseña</label>
        <input type="password" class="text-field" placeholder="contraseña" id="login-pass">
      </div>
      <div class="button">
        <button class="btn btn-primary" onclick="login()">ingresar</button>
      </div>
      <div class="link" style="text-align: center; margin-top: 10px">
        <a href="#" style="color: #004aa2" onclick="navigate_to('register-user'); return false;">registrarse como operario</a>
      </div>
    </div>
  </div>
</div>`,

    'register-user': `
<div class="screen">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('home')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <div style="padding: 20px 0">
    <div class="menu-logo"><img src="Images/Logo.png"></div>
    <h1 class="title title-center">crear cuenta<br>operario</h1>
    <div class="login-card">
      <div class="input-group">
        <label class="input-label">nuevo usuario</label>
        <input type="text" class="text-field" placeholder="nombre de usuario" id="reg-new-user">
      </div>
      <div class="input-group">
        <label class="input-label">contraseña</label>
        <input type="password" class="text-field" placeholder="mínimo 4 caracteres" id="reg-new-pass">
      </div>
      <div class="button">
        <button class="btn btn-primary" onclick="execute_user_registration()">crear cuenta</button>
      </div>
    </div>
  </div>
</div>`,

    menu: `
<div class="screen">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('home')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <h2 class="section-title">¿qué deseas hacer?</h2>
  <div class="menu-grid">
    <div class="menu-item" onclick="navigate_to('entry-control')">
      <div class="menu-icon"><img src="Images/entrar.png"></div>
      <div class="menu-text">control de ingreso</div>
    </div>
    <div class="menu-item" onclick="navigate_to('exit-control')">
      <div class="menu-icon"><img src="Images/salir.png"></div>
      <div class="menu-text">control de salida</div>
    </div>
  </div>
  <h2 class="section-sub">consulta disponibilidad:</h2>
  <div class="menu-grid">
    <div class="menu-item" onclick="view_availability('carro')">
      <div class="vehicle-icon"><img src="Images/carro.png"></div>
      <div class="menu-text">cupos carro</div>
    </div>
    <div class="menu-item" onclick="view_availability('moto')">
      <div class="vehicle-icon"><img src="Images/moto.png"></div>
      <div class="menu-text">cupos moto</div>
    </div>
  </div>
  <div class="menu-grid">
    <div class="menu-item" onclick="navigate_to('history')">
      <div class="menu-icon"><img src="Images/historial.png"></div>
      <div class="menu-text">historial</div>
    </div>
    <div class="menu-item" onclick="navigate_to('vehicle-registration')">
      <div class="menu-icon" style="background: #e0f2fe; display:flex; align-items:center; justify-content:center; border-radius:12px;">
         <span style="font-size: 24px; color: #0ea5e9">🚗+</span>
      </div>
      <div class="menu-text">registrar vehículo</div>
    </div>
  </div>
  <div class="button" style="margin-top: 20px;">
    <button class="btn btn-secondary" onclick="run_etl_process()" style="border-color: #10b981; color: #10b981;">
      Sincronizar Datos (ETL)
    </button>
  </div>
</div>`,

    'entry-control': `
<div class="screen">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('menu')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <h1 class="title title-center" style="margin-top: 20px">control de ingreso</h1>
  <div class="vehicle-grid">
    <div class="vehicle-option active" data-type="carro" onclick="select_vehicle(this, 'carro')">
      <div class="vehicle-icon"><img src="Images/carro.png"></div>
      <div class="vehicle-name">carro</div>
    </div>
    <div class="vehicle-option" data-type="moto" onclick="select_vehicle(this, 'moto')">
      <div class="vehicle-icon"><img src="Images/moto.png"></div>
      <div class="vehicle-name">moto</div>
    </div>
  </div>
  <div class="input-group" style="padding: 0 24px;">
    <label class="input-label">número de placa</label>
    <input type="text" class="text-field" placeholder="ej: abc123" id="entry-plate">
  </div>
  <div class="button">
    <button class="btn btn-primary" onclick="register_entry()">registrar entrada</button>
  </div>
</div>`,

    'vehicle-registration': `
<div class="screen">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('menu')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <h1 class="title title-center" style="margin-top: 15px">registro de vehículo</h1>
  <div class="vehicle-grid">
    <div class="vehicle-option active" data-type="carro" onclick="select_vehicle(this, 'carro')">
      <div class="vehicle-icon"><img src="Images/carro.png"></div>
      <div class="vehicle-name">carro</div>
    </div>
    <div class="vehicle-option" data-type="moto" onclick="select_vehicle(this, 'moto')">
      <div class="vehicle-icon"><img src="Images/moto.png"></div>
      <div class="vehicle-name">moto</div>
    </div>
  </div>
  <div class="login-card" style="margin-top: 10px; padding-bottom: 20px;">
    <div class="input-group">
      <label class="input-label">número de placa</label>
      <input type="text" class="text-field" placeholder="ej: abc123" id="reg-plate">
    </div>
    <div style="display: flex; gap: 10px;">
      <div class="input-group" style="flex: 1;">
        <label class="input-label">marca</label>
        <input type="text" class="text-field" placeholder="ej: mazda" id="reg-brand">
      </div>
      <div class="input-group" style="flex: 1;">
        <label class="input-label">modelo</label>
        <input type="text" class="text-field" placeholder="ej: 2024" id="reg-model">
      </div>
    </div>
    <div class="input-group">
      <label class="input-label">nombre del propietario</label>
      <input type="text" class="text-field" placeholder="nombre completo" id="reg-owner">
    </div>
    <div class="input-group">
      <label class="input-label">documento (id / cédula)</label>
      <input type="text" class="text-field" placeholder="número de identificación" id="reg-doc-id">
    </div>
    <div class="button" style="margin-top: 20px; padding: 0;">
      <button class="btn btn-primary" onclick="register_vehicle()">guardar en sistema</button>
    </div>
  </div>
</div>`,

    'exit-control': `
<div class="screen">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('menu')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <h1 class="title title-center" style="margin-top: 20px">control de salida</h1>
  <div class="input-group" style="padding: 0 24px;">
    <label class="input-label">número de placa</label>
    <input type="text" class="text-field" placeholder="ej: abc123" id="exit-plate">
  </div>
  <div class="button">
    <button class="btn btn-primary" onclick="search_vehicle_exit()">buscar vehículo</button>
  </div>
  <div id="exit-info" style="margin: 20px 24px; display: none;"></div>
  <div class="button">
    <button class="btn btn-success" onclick="confirm_exit()" style="display: none;" id="btn-confirm">confirmar y pagar</button>
  </div>
</div>`,

    availability: `
<div class="screen">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('menu')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <h1 class="title title-center" id="titulo-cupos">disponibilidad</h1>
  <div id="availability-content"></div>
  <div class="button">
    <button class="btn btn-secondary" onclick="navigate_to('menu')">volver</button>
  </div>
</div>`,

    history: `
<div class="screen screen-white">
  <div class="header">
    <div class="back-btn" onclick="navigate_to('menu')"><img src="Images/flecha.png"></div>
    <div class="logo">park<span>easy</span></div>
    <div></div>
  </div>
  <h1 class="title" style="padding: 0 24px; margin-top: 20px">historial de actividad</h1>
  <div id="history-list" style="padding-bottom: 30px"></div>
</div>`,

    'successful-exit': `
<div class="screen screen-white">
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px">
    <div style="font-size: 60px; margin-bottom: 10px">✅</div>
    <h1 class="title title-center">salida exitosa</h1>
    <p class="subtitle">comprobante de pago generado</p>
    <div class="card" style="width: 100%; margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0;">
      <div class="card-row"><span>placa:</span><strong id="success-plate">-</strong></div>
      <div class="card-row"><span>total cobrado:</span><strong id="success-payment" style="color: #059669; font-size: 1.2em">-</strong></div>
      <div class="card-row"><span>fecha:</span><span id="success-date" style="font-size: 12px; color: #64748b"></span></div>
    </div>
    <button class="btn btn-primary" onclick="navigate_to('menu')">ir al menú principal</button>
  </div>
</div>`
};

// ==================== NAVEGACIÓN ====================
function navigate_to(screen_name) {
    if (templates[screen_name]) {
        document.getElementById('app').innerHTML = templates[screen_name];
        if (screen_name === 'history') load_history();
    }
}

// ==================== UTILIDADES ====================
function select_vehicle(element, type) {
    selected_vehicle_type = type;
    document.querySelectorAll('.vehicle-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

// ==================== AUTENTICACIÓN ====================
async function login() {
    const user = document.getElementById('login-user')?.value;
    const pass = document.getElementById('login-pass')?.value;
    if (!user || !pass) return alert("por favor complete todos los campos");

    try {
        const response = await fetch(`${api_url}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await response.json();
        data.success ? navigate_to('menu') : alert(data.error);
    } catch (e) { alert("error de servidor"); }
}

async function execute_user_registration() {
    const user = document.getElementById('reg-new-user')?.value;
    const pass = document.getElementById('reg-new-pass')?.value;
    if (!user || !pass) return alert("por favor complete todos los campos");

    try {
        const response = await fetch(`${api_url}/register-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await response.json();
        if (data.success) { 
            alert("operario creado con éxito"); 
            navigate_to('home'); 
        } else alert(data.error);
    } catch (e) { alert("error al conectar"); }
}

// ==================== VEHÍCULOS ====================
async function register_vehicle() {
    const vehicle_data = {
        placa: document.getElementById('reg-plate')?.value,
        tipo: selected_vehicle_type,
        marca: document.getElementById('reg-brand')?.value,
        modelo: document.getElementById('reg-model')?.value,
        nombre: document.getElementById('reg-owner')?.value,
        identificacion: document.getElementById('reg-doc-id')?.value
    };

    if (!vehicle_data.placa || !vehicle_data.identificacion) {
        return alert("la placa y el documento de identidad son obligatorios");
    }

    try {
        const response = await fetch(`${api_url}/registrar-vehiculo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicle_data)
        });
        const res = await response.json();
        res.success ? (alert("vehículo guardado correctamente"), navigate_to('menu')) : alert(res.error);
    } catch (e) { alert("error al registrar en la base de datos"); }
}

// ==================== INGRESOS ====================
async function register_entry() {
    const placa = document.getElementById('entry-plate')?.value;
    if (!placa) return alert("ingrese la placa");

    try {
        const response = await fetch(`${api_url}/registrar-ingreso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placa })
        });
        const data = await response.json();
        data.success ? (alert("ingreso registrado correctamente"), navigate_to('menu')) : alert(data.error);
    } catch (e) { alert("error de conexión"); }
}

// ==================== SALIDAS ====================
async function search_vehicle_exit() {
    const placa = document.getElementById('exit-plate')?.value;
    if (!placa) return alert("ingrese la placa");

    try {
        const response = await fetch(`${api_url}/buscar-vehiculo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placa })
        });
        const data = await response.json();
        if (data.success) {
            found_vehicle = data.vehiculo;
            const info_div = document.getElementById('exit-info');
            info_div.style.display = 'block';
            info_div.innerHTML = `
                <div class="card" style="border-left: 4px solid #3b82f6; background: #f8fafc;">
                    <div class="card-title" style="color: #1e293b; margin-bottom: 10px;">resumen de estancia</div>
                    <div class="card-row"><span>placa:</span><strong>${found_vehicle.placa.toLowerCase()}</strong></div>
                    <div class="card-row"><span>ingreso:</span><span style="color: #64748b">${new Date(found_vehicle.horaIngreso).toLocaleTimeString()}</span></div>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px solid #e2e8f0">
                    <div class="card-row"><span style="font-weight:bold; color: #1e293b;">total a pagar:</span><strong style="color:#2563eb; font-size: 1.2em">$${found_vehicle.valorEstimado}</strong></div>
                </div>`;
            document.getElementById('btn-confirm').style.display = 'block';
        } else alert(data.error);
    } catch (e) { alert("vehículo no encontrado o error de red"); }
}

async function confirm_exit() {
    if (!found_vehicle) return;
    const p_plate = found_vehicle.placa;
    const p_amount = found_vehicle.valorEstimado;

    try {
        const response = await fetch(`${api_url}/registrar-salida`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId: found_vehicle.id, totalPay: p_amount })
        });
        const data = await response.json();
        if (data.success) {
            navigate_to('successful-exit');
            setTimeout(() => {
                document.getElementById('success-plate').textContent = p_plate.toLowerCase();
                document.getElementById('success-payment').textContent = `$${p_amount}`;
                document.getElementById('success-date').textContent = new Date().toLocaleString();
                found_vehicle = null;
            }, 50);
        }
    } catch (e) { alert("error procesando pago"); }
}

// ==================== HISTORIAL ====================
async function load_history() {
    try {
        const response = await fetch(`${api_url}/historial`);
        const data = await response.json();
        const container = document.getElementById('history-list');
        
        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color: #64748b;">no hay registros aún.</p>';
            return;
        }
        
        container.innerHTML = data.map(reg => `
            <div class="history-item" style="border-left: 4px solid ${reg.estado === 'active' ? '#f59e0b' : '#10b981'}; margin: 10px 24px; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1">
                    <div class="history-date" style="font-size: 16px;"><strong>${reg.placa.toLowerCase()}</strong> • <span style="font-size: 12px; color: #64748b;">${reg.tipo_vehiculo ? reg.tipo_vehiculo : 'vehículo'}</span></div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">entrada: ${new Date(reg.hora_ingreso).toLocaleString()}</div>
                    ${reg.hora_salida ? `<div style="font-size: 12px; color: #64748b;">salida: ${new Date(reg.hora_salida).toLocaleString()}</div>` : '<div style="font-size: 11px; color: #f59e0b; font-weight: bold; margin-top: 2px;">en parqueadero</div>'}
                </div>
                <div style="text-align: right">
                    <div class="history-amount" style="color: ${reg.estado === 'active' ? '#64748b' : '#059669'}; font-size: 16px; font-weight: bold;">$${reg.valor_pago || 0}</div>
                    <div class="badge" style="font-size: 9px; padding: 4px 8px; border-radius: 4px; margin-top: 6px; display: inline-block; background: ${reg.estado === 'active' ? '#fef3c7' : '#d1fae5'}; color: ${reg.estado === 'active' ? '#d97706' : '#059669'};">${reg.estado === 'active' ? 'activo' : 'finalizado'}</div>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// ==================== DISPONIBILIDAD ====================
async function view_availability(type) {
    navigate_to('availability');
    try {
        const response = await fetch(`${api_url}/cupos`);
        const data = await response.json();
        const slot = data.find(c => c.tipo_vehiculo === type);
        const container = document.getElementById('availability-content');
        
        container.innerHTML = `
            <div class="card" style="text-align: center; margin: 40px 24px; padding: 30px 20px; border-top: 4px solid #0ea5e9;">
                <div style="font-size: 14px; color: #64748b; letter-spacing: 1px; font-weight: bold;">cupos ${type}</div>
                <div class="stat-number" style="font-size: 72px; color: #1e293b; margin: 15px 0; font-weight: bold;">${slot.total - slot.ocupados}</div>
                <div class="stat-label" style="color: #10b981; font-weight: bold; font-size: 16px;">espacios disponibles</div>
                <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0">
                <div class="card-row" style="color: #475569;"><span>capacidad total:</span><strong>${slot.total}</strong></div>
                <div class="card-row" style="color: #475569;"><span>vehículos parqueados:</span><strong>${slot.ocupados}</strong></div>
            </div>
        `;
    } catch (e) { alert("error al cargar cupos"); }
}

async function run_etl_process() {
    if(!confirm("¿Deseas iniciar el proceso de sincronización de Firebase a MySQL?")) return;

    try {
        const response = await fetch(`${api_url}/ejecutar-etl`, { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            alert("Sincronización Exitosa: \n" + data.message);
        } else {
            alert("Error en el proceso ETL: " + data.error);
        }
    } catch (e) { 
        alert("Error de conexión al intentar ejecutar ETL."); 
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => navigate_to('home'));