// Apuntamos al puerto donde corre tu Spring Boot
const API_BASE = 'https://ecowash-di2g.onrender.com/api/admin'; // O 'http://localhost:9090/api/admin' si estás en local

document.addEventListener('DOMContentLoaded', () => {
    // 1. Controles de Ventana (Electron)
    const btnMin = document.getElementById('btn-min');
    const btnMax = document.getElementById('btn-max');
    const btnClose = document.getElementById('btn-close');

    if (btnMin) btnMin.addEventListener('click', () => window.api.window.minimize());
    if (btnMax) btnMax.addEventListener('click', () => window.api.window.maximize());
    if (btnClose) btnClose.addEventListener('click', () => window.api.window.close());
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 2. Enrutador de Vistas Automático
    if (document.getElementById('tablaPedidos')) {
        cargarPedidos();
        setInterval(cargarPedidos, 15000); // Refresco cada 15s
    } else if (document.getElementById('tablaClientes')) {
        cargarClientes();
    } else if (document.querySelector('.dashboard-grid')) {
        cargarIngresos(); // Para la vista de ingresos
    }
});

// ==========================================
// MÓDULO: PEDIDOS (index.html)
// ==========================================
async function cargarPedidos() {
    const tbody = document.getElementById('tablaPedidos');
    if (!tbody) return;

    try {
        // 1. TÉCNICA CACHE-BUSTING: Forzamos la actualización sin usar cabeceras CORS restrictivas
        const t = new Date().getTime();
        const response = await fetch(`${API_BASE}/pedidos?_t=${t}`, { 
            method: 'GET',
            headers: { 
                'Accept': 'application/json'
            },
            cache: 'no-store' // Previene caché interno de disco de Chromium
        });
        
        if (!response.ok) throw new Error('Error HTTP');
        const pedidos = await response.json();
        
        // Variables para calcular KPIs
        let contPendientes = 0;
        let contLavado = 0;
        let contTerminados = 0;
        const hoyStr = new Date().toISOString().split('T')[0];
        let contHoy = 0;

        tbody.innerHTML = '';
        
        if(pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No hay pedidos registrados</td></tr>';
            return;
        }

        pedidos.forEach(p => {
            // Contabilizar KPIs
            if (p.estado === 'PENDIENTE') contPendientes++;
            if (p.estado === 'EN_LAVADORA' || p.estado === 'PLANCHANDO') contLavado++;
            if (p.estado === 'TERMINADO' || p.estado === 'ENTREGADO') contTerminados++;
            if (p.fechaServicio === hoyStr) contHoy++;

            const estadoClase = obtenerClaseEstado(p.estado);
            const estadoTexto = formatearEstado(p.estado);
            const inicial = p.cliente && p.cliente.nombre ? p.cliente.nombre.charAt(0).toUpperCase() : '?';
            const nombreCli = p.cliente ? p.cliente.nombre : 'Cliente Eliminado';

            const tr = document.createElement('tr');
            tr.dataset.estado = estadoClase;
            tr.innerHTML = `
                <td><span class="order-code">${p.codigo}</span></td>
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">${inicial}</div>
                        <span>${nombreCli}</span>
                    </div>
                </td>
                <td>${p.servicioElegido || 'Estandar'}</td>
                <td>${p.items ? p.items.length : 0} prendas</td>
                <td class="td-amount">S/ ${p.total.toFixed(2)}</td>
                <td><span class="badge badge-${estadoClase}">${estadoTexto}</span></td>
                <td>
                    <select class="btn btn-ghost" style="padding: 4px; font-size:0.8rem;" onchange="actualizarEstado(${p.id}, this.value)">
                        <option value="" disabled selected>Cambiar estado</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_LAVADORA">En Lavadora</option>
                        <option value="PLANCHANDO">Planchando</option>
                        <option value="TERMINADO">Terminado</option>
                        <option value="ENTREGADO">Entregado</option>
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Actualizar Tarjetas KPI en el DOM
        const kpis = document.querySelectorAll('.kpi-val');
        if (kpis.length >= 4) {
            kpis[0].innerText = contPendientes;
            kpis[1].innerText = contLavado;
            kpis[2].innerText = contTerminados;
            kpis[3].innerText = contHoy;
        }

        // Re-ejecutar lógica de pestañas (filtros locales)
        aplicarFiltroActivo('tablaPedidos');

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

// CORRECCIÓN: Función restaurada a su versión PUT para actualizar estados
async function actualizarEstado(id, nuevoEstado) {
    if(!nuevoEstado) return;
    try {
        const response = await fetch(`${API_BASE}/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (response.ok) {
            cargarPedidos(); // Recargar la tabla si tuvo éxito
        } else {
            alert('Error al actualizar estado');
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// MÓDULO: CLIENTES (clientes.html)
// ==========================================
async function cargarClientes() {
    const tbody = document.getElementById('tablaClientes');
    if (!tbody) return;

    try {
        // TÉCNICA CACHE-BUSTING
        const t = new Date().getTime();
        const response = await fetch(`${API_BASE}/clientes?_t=${t}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('Error HTTP');
        const clientes = await response.json();
        
        tbody.innerHTML = '';
        
        if(clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay clientes registrados</td></tr>';
            return;
        }

        clientes.forEach(c => {
            const tr = document.createElement('tr');
            tr.dataset.estado = c.estado ? c.estado.toLowerCase() : 'activo'; 
            tr.innerHTML = `
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">${c.nombre.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="client-name">${c.nombre}</div>
                            <div class="client-email">${c.correo}</div>
                        </div>
                    </div>
                </td>
                <td>${c.telefono || 'Sin registro'}</td>
                <td>${c.direccion || 'Sin registro'}</td>
                <td><span class="order-count">${c.totalPedidos || 0}</span></td>
                <td>${c.fechaUltimoPedido || 'Reciente'}</td>
                <td><span class="badge badge-terminado">${c.estado || 'Activo'}</span></td>
                <td><button class="btn btn-ghost" onclick="alert('Próximamente: Ficha de cliente')">Ver historial</button></td>
            `;
            tbody.appendChild(tr);
        });

        // Actualizar KPI total clientes
        const kpis = document.querySelectorAll('.kpi-val');
        if (kpis.length > 0) {
            kpis[0].innerText = clientes.length;
        }

        aplicarFiltroActivo('tablaClientes');

    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}

// ==========================================
// MÓDULO: INGRESOS (Carga Secuencial y Blindaje)
// ==========================================
async function cargarIngresos() {
    // 1. Verificación: Si no estamos en la vista de ingresos, detenemos la función
    const kpiIng = document.getElementById('kpi-ingresos');
    if (!kpiIng) return;

    try {
        // Cache-Busting
        const t = new Date().getTime();
        const fetchConfig = { 
            method: 'GET', 
            headers: { 'Accept': 'application/json' }, 
            cache: 'no-store' 
        };

        // 2. CARGA SECUENCIAL: Previene saturar el pool de conexiones en la capa gratuita
        const resPedidos = await fetch(`${API_BASE}/pedidos?_t=${t}`, fetchConfig);
        if (!resPedidos.ok) throw new Error(`Fallo en /pedidos: HTTP ${resPedidos.status}`);
        const pedidos = await resPedidos.json();

        const resClientes = await fetch(`${API_BASE}/clientes?_t=${t}`, fetchConfig);
        if (!resClientes.ok) throw new Error(`Fallo en /clientes: HTTP ${resClientes.status}`);
        const clientes = await resClientes.json();

        let ingresosTotales = 0;
        let pedidosCompletados = 0;
        let pedidosCancelados = 0;
        let totalPrendas = 0;
        const ingresosPorMes = {}; 

        // 3. MATEMÁTICAS A PRUEBA DE FALLOS (Evita que datos null rompan la app)
        pedidos.forEach(p => {
            if (p.estado !== 'CANCELADO') {
                ingresosTotales += (p.total || 0); // Si el total es null, suma 0
                pedidosCompletados++;
                totalPrendas += p.items ? p.items.length : 0;

                let mesClave = 'Sin Fecha';
                if (p.fechaServicio) {
                    const fecha = new Date(p.fechaServicio);
                    // Blindaje: Solo procesar si la fecha es realmente válida en JavaScript
                    if (!isNaN(fecha.getTime())) { 
                        mesClave = `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`;
                    }
                }
                ingresosPorMes[mesClave] = (ingresosPorMes[mesClave] || 0) + (p.total || 0);
            } else {
                pedidosCancelados++;
            }
        });

        const gastosEstimados = ingresosTotales * 0.65;
        const beneficioNeto = ingresosTotales - gastosEstimados;
        const ticketPromedio = pedidosCompletados > 0 ? (ingresosTotales / pedidosCompletados) : 0;
        const totalPedidos = pedidos.length;
        const tasaCancelacion = totalPedidos > 0 ? (pedidosCancelados / totalPedidos) * 100 : 0;
        const totalClientes = clientes.length;
        const prendasPorPedido = pedidosCompletados > 0 ? (totalPrendas / pedidosCompletados) : 0;

        let mesTop = 'N/A';
        let maxIngreso = 0;
        for (const [mes, monto] of Object.entries(ingresosPorMes)) {
            if (monto > maxIngreso) {
                maxIngreso = monto;
                mesTop = mes;
            }
        }

        // 4. INYECCIÓN AL DOM (KPIs)
        kpiIng.innerText = `S/ ${ingresosTotales.toFixed(2)}`;
        document.getElementById('kpi-gastos').innerText = `S/ ${gastosEstimados.toFixed(2)}`;
        document.getElementById('kpi-clientes').innerText = totalClientes;
        document.getElementById('kpi-neto').innerText = `S/ ${beneficioNeto.toFixed(2)}`;

        // 5. INYECCIÓN DEL GRÁFICO 
        const chartContainer = document.getElementById('dynamic-chart');
        if(chartContainer) {
            chartContainer.innerHTML = '';
            const maxMontoMensual = Math.max(...Object.values(ingresosPorMes), 1); 

            Object.keys(ingresosPorMes).sort().forEach(mesStr => {
                const ingresoMensual = ingresosPorMes[mesStr];
                const gastoMensual = ingresoMensual * 0.65;
                const alturaIngreso = (ingresoMensual / maxMontoMensual) * 100;
                const alturaGasto = (gastoMensual / maxMontoMensual) * 100;
                
                let mesNombre = mesStr;
                // Blindaje extra para evitar RangeError al convertir la fecha
                if (mesStr.includes('-')) {
                    const [y, m] = mesStr.split('-');
                    mesNombre = new Date(y, m - 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
                }

                chartContainer.innerHTML += `
                    <div class="bar-group">
                        <div class="bar-wrapper">
                            <div class="bar" style="height: ${alturaIngreso}%;" title="Ingresos: S/ ${ingresoMensual.toFixed(2)}"></div>
                        </div>
                        <div class="bar-wrapper">
                            <div class="bar expense" style="height: ${alturaGasto}%;" title="Gastos: S/ ${gastoMensual.toFixed(2)}"></div>
                        </div>
                        <span class="bar-label" style="text-transform: capitalize;">${mesNombre}</span>
                    </div>
                `;
            });
        }

        // 6. INYECCIÓN DE TABLAS
        const metricsFin = document.getElementById('metrics-finanzas');
        if(metricsFin) metricsFin.innerHTML = `
            <tr><td><strong>Ingresos Brutos Históricos</strong></td><td>S/ ${ingresosTotales.toFixed(2)}</td></tr>
            <tr><td><strong>Gastos Operativos (65% ROI)</strong></td><td>S/ ${gastosEstimados.toFixed(2)}</td></tr>
            <tr><td><strong>Margen de Beneficio Neto</strong></td><td><span style="color:var(--leaf); font-weight:bold;">S/ ${beneficioNeto.toFixed(2)}</span></td></tr>
            <tr><td><strong>Ticket Promedio de Venta</strong></td><td>S/ ${ticketPromedio.toFixed(2)} por pedido</td></tr>
            <tr><td><strong>Mes de Mayor Rendimiento</strong></td><td>${mesTop} (S/ ${maxIngreso.toFixed(2)})</td></tr>
        `;

        const metricsOp = document.getElementById('metrics-operaciones');
        if(metricsOp) metricsOp.innerHTML = `
            <tr><td><strong>Total de Pedidos Efectivos</strong></td><td>${pedidosCompletados} transacciones</td></tr>
            <tr><td><strong>Volumen de Ropa Lavada</strong></td><td>${totalPrendas} prendas</td></tr>
            <tr><td><strong>Promedio de Prendas (Ticket)</strong></td><td>${prendasPorPedido.toFixed(1)} prendas</td></tr>
            <tr><td><strong>Tasa de Cancelación / Fallos</strong></td><td><span style="color:${tasaCancelacion > 15 ? 'red' : 'inherit'}">${tasaCancelacion.toFixed(1)}%</span></td></tr>
            <tr><td><strong>Adquisición de Clientes</strong></td><td>${totalClientes} usuarios registrados</td></tr>
        `;

    } catch(error) { 
        console.error("Fallo crítico en el dashboard de ingresos:", error); 
        // 7. RESPUESTA VISUAL DE ERROR (Para no dejar la pantalla congelada)
        const chartContainer = document.getElementById('dynamic-chart');
        if(chartContainer) {
            chartContainer.innerHTML = `
                <div style="width:100%; padding: 2rem; color: #dc2626; text-align:center; background:#fee2e2; border-radius:8px;">
                    <strong>Error de conexión o de datos:</strong> ${error.message}
                </div>
            `;
        }
    }
}

// ==========================================
// UTILIDADES Y FILTROS
// ==========================================
function obtenerClaseEstado(estado) {
    if (estado === 'PENDIENTE') return 'pendiente';
    if (estado === 'EN_LAVADORA' || estado === 'PLANCHANDO') return 'lavado';
    if (estado === 'TERMINADO' || estado === 'ENTREGADO') return 'terminado';
    if (estado === 'CANCELADO') return 'danger';
    return 'pendiente';
}

function formatearEstado(estado) {
    if (estado === 'EN_LAVADORA') return 'En Lavado';
    return estado.charAt(0) + estado.slice(1).toLowerCase();
}

function aplicarFiltroActivo(tablaId) {
    const tabActiva = document.querySelector('.filter-tab.active');
    if(tabActiva) {
        const filtro = tabActiva.dataset.filter;
        document.querySelectorAll(`#${tablaId} tr`).forEach(row => {
            if (filtro === 'all' || row.dataset.estado === filtro) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}