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

async function cargarPedidos() {
    try {
        // En producción, reemplaza esto con un WebSocket (STOMP) para evitar el polling
        const response = await fetch(`${API_URL}/activos`);
        
        // Simulación temporal por si el backend aún no está listo:
        /*
        const response = { ok: true, json: () => Promise.resolve([
            { codigo: 'ECO-1234', cliente: 'Juan Perez', servicio: 'Completo', estado: 'PENDIENTE' }
        ])};
        */

        if (response.ok) {
            const pedidos = await response.json();
            renderizarTabla(pedidos);
        }
    } catch (error) {
        console.error('Error al conectar con el servidor Spring Boot:', error);
    }
}

function renderizarTabla(pedidos) {
    const tbody = document.getElementById('pedidosBody');
    tbody.innerHTML = '';

    pedidos.forEach(p => {
        const tr = document.createElement('tr');
        
        // Selector dinámico de estado
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

async function actualizarEstado(codigo, nuevoEstado) {
    try {
        const response = await fetch(`${API_URL}/${codigo}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (response.ok) {
            console.log(`Estado de ${codigo} actualizado a ${nuevoEstado}`);
            // El cliente web de Spring Boot verá esto si comparten BD
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
    }
}

// Listeners para los botones de control de ventana
document.addEventListener('DOMContentLoaded', () => {
    const btnMin = document.getElementById('btn-min');
    const btnMax = document.getElementById('btn-max');
    const btnClose = document.getElementById('btn-close');

    if (btnMin) btnMin.addEventListener('click', () => window.api.window.minimize());
    if (btnMax) btnMax.addEventListener('click', () => window.api.window.maximize());
    if (btnClose) btnClose.addEventListener('click', () => window.api.window.close());
    
    // Si usas lucide.createIcons() globalmente, asegúrate de llamarlo después de cargar este DOM
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Para "Tiempo Real" simple (Polling cada 5 segundos)
setInterval(cargarPedidos, 5000);
cargarPedidos();