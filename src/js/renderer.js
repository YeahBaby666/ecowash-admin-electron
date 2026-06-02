// ENTORNO DE EJECUCIÓN: VISUAL STUDIO CODE (Archivo: src/js/renderer.js)

// URL de tu SEGUNDO Spring Boot (el de Administración)
const API_URL = 'http://localhost:9091/api/admin/pedidos';

// Simulación de los estados del backend
const ESTADOS = [
    'PENDIENTE', 
    'RECOGIDO', 
    'EN_LAVADORA', 
    'PLANCHANDO', 
    'TERMINADO', 
    'ENTREGADO'
];

// DATA DE PRUEBA ESTÁTICA PARA LA NUEVA PANTALLA DE INGRESOS
const ingresosSimulados = [
    { id: 1, concepto: "Lavado Premium - Pedido #104", monto: "S/. 45.00", fecha: "2026-06-02" },
    { id: 2, concepto: "Servicio Delivery - Pedido #102", monto: "S/. 10.00", fecha: "2026-06-02" },
    { id: 3, concepto: "Lavado Completo - Pedido #105", monto: "S/. 35.00", fecha: "2026-06-02" }
];

async function cargarPedidos() {
    try {
        const response = await fetch(`${API_URL}/activos`);
        if (response.ok) {
            const pedidos = await response.json();
            renderizarTabla(pedidos);
        } else {
            usarPedidosSimulados();
        }
    } catch (error) {
        console.warn('Backend offline. Cargando simulación estática para el laboratorio.');
        usarPedidosSimulados();
    }
}

function usarPedidosSimulados() {
    const pedidosPrueba = [
        { codigo: 'ECO-1234', cliente: 'Juan Perez', servicio: 'Completo', estado: 'PENDIENTE' },
        { codigo: 'ECO-5678', cliente: 'Aaron Mendoza', servicio: 'Premium', estado: 'EN_LAVADORA' }
    ];
    renderizarTabla(pedidosPrueba);
}

function renderizarTabla(pedidos) {
    const tbody = document.getElementById('pedidosBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    pedidos.forEach(p => {
        const tr = document.createElement('tr');
        let selectHtml = `<select onchange="actualizarEstado('${p.codigo}', this.value)">`;
        ESTADOS.forEach(est => {
            selectHtml += `<option value="${est}" ${p.estado === est ? 'selected' : ''}>${est}</option>`;
        });
        selectHtml += `</select>`;

        tr.innerHTML = `
            <td><strong>${p.codigo}</strong></td>
            <td>${p.cliente}</td>
            <td>${p.servicio}</td>
            <td>${selectHtml}</td>
            <td>
                <button onclick="verDetalles('${p.codigo}')">Detalles</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// NUEVA FUNCIÓN: ENCARGADA DE POBLAR LA TABLA EN INGRESOS.HTML
function cargarTablaIngresos() {
    const tabla = document.getElementById('ingresosBody'); 
    if (!tabla) return; // Si no estamos en ingresos.html, termina pacíficamente

    tabla.innerHTML = ingresosSimulados.map(ing => `
        <tr>
            <td><strong>#ING-${ing.id}</strong></td>
            <td>${ing.concepto}</td>
            <td><span class="txt-success" style="color: #4CAF50; font-weight: 600;">${ing.monto}</span></td>
            <td>${ing.fecha}</td>
        </tr>
    `).join('');
}

async function actualizarEstado(codigo, nuevoEstado) {
    try {
        const response = await fetch(`${API_URL}/${codigo}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (response.ok) {
            console.log(`Estado de ${codigo} actualizado a ${nuevoEstado}`);
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
    }
}

// Listeners globales del sistema
document.addEventListener('DOMContentLoaded', () => {
    const btnMin = document.getElementById('btn-min');
    const btnMax = document.getElementById('btn-max');
    const btnClose = document.getElementById('btn-close');

    if (btnMin) btnMin.addEventListener('click', () => window.api.window.minimize());
    if (btnMax) btnMax.addEventListener('click', () => window.api.window.maximize());
    if (btnClose) btnClose.addEventListener('click', () => window.api.window.close());
    
    // Inicializar funciones de la vista actual
    cargarTablaIngresos();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Polling controlado de pedidos
setInterval(cargarPedidos, 5000);
cargarPedidos();