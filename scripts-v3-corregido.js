/* ============================================
   SISTEMA DE NÓMINA PROFESIONAL v3.0
   Archivo: scripts-v3-corregido.js
   Fecha: Noviembre 2025
   ============================================ */

// ==================== VARIABLES GLOBALES ====================
let empleados = JSON.parse(localStorage.getItem('empleados')) || [];
let pagos = JSON.parse(localStorage.getItem('pagos')) || [];
let adelantos = JSON.parse(localStorage.getItem('adelantos')) || [];
let departamentos = JSON.parse(localStorage.getItem('departamentos')) || [];
let vacaciones = JSON.parse(localStorage.getItem('vacaciones')) || [];
let licencias = JSON.parse(localStorage.getItem('licencias')) || [];

// Variables para edición
let empleadoEditando = null;
let adelantoEditando = null;
let departamentoEditando = null;
let vacacionEditando = null;
let licenciaEditando = null;

// Variables para calendario
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

// Configuración AFP Chile
const AFP_CHILE = {
    capital: { nombre: 'Capital', porcentaje: 10.77 },
    cuprum: { nombre: 'Cuprum', porcentaje: 11.44 },
    habitat: { nombre: 'Habitat', porcentaje: 11.54 },
    planvital: { nombre: 'Planvital', porcentaje: 11.14 },
    provida: { nombre: 'Provida', porcentaje: 10.49 },
    modelo: { nombre: 'Modelo', porcentaje: 10.69 },
    uno: { nombre: 'Uno', porcentaje: 10.83 }
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Sistema de Nómina v3.0...');
    
    // Cargar tema guardado
    const temaGuardado = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    
    // Inicializar datos de demostración si es necesario
    if (empleados.length === 0) {
        inicializarDatosDemostracion();
    }
    
    // Inicializar vistas
    inicializarSelectores();
    actualizarDashboard();
    mostrarEmpleados();
    mostrarPagos();
    mostrarAdelantos();
    mostrarDepartamentos();
    mostrarVacaciones();
    mostrarLicencias();
    renderizarCalendario();
    actualizarEstadisticasAdelantos();
    
    // Establecer fecha actual en formularios
    establecerFechaActual();
    
    console.log('✅ Sistema cargado correctamente');
    console.log(`📊 Empleados: ${empleados.length}`);
    console.log(`💰 Pagos: ${pagos.length}`);
    console.log(`💸 Adelantos: ${adelantos.length}`);
});

// ==================== DATOS DE DEMOSTRACIÓN ====================
function inicializarDatosDemostracion() {
    // Crear departamentos de ejemplo
    departamentos = [
        { id: generarId(), nombre: 'Administración', descripcion: 'Área administrativa' },
        { id: generarId(), nombre: 'Ventas', descripcion: 'Área comercial' },
        { id: generarId(), nombre: 'Operaciones', descripcion: 'Área operativa' }
    ];
    
    guardarDatos();
    console.log('✅ Datos de demostración inicializados');
}

// ==================== FUNCIONES DE NAVEGACIÓN ====================
function cambiarTab(tabId) {
    // Ocultar todas las tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar tab seleccionada
    document.getElementById(tabId).classList.add('active');
    
    // Activar botón correspondiente
    event.target.classList.add('active');
    
    // Actualizar contenido según la tab
    switch(tabId) {
        case 'dashboard':
            actualizarDashboard();
            break;
        case 'empleados':
            mostrarEmpleados();
            break;
        case 'pagos':
            mostrarPagos();
            break;
        case 'adelantos':
            mostrarAdelantos();
            actualizarEstadisticasAdelantos();
            break;
        case 'departamentos':
            mostrarDepartamentos();
            break;
        case 'vacaciones':
            mostrarVacaciones();
            break;
        case 'licencias':
            mostrarLicencias();
            break;
        case 'calendario':
            renderizarCalendario();
            break;
        case 'reportes':
            inicializarReportes();
            break;
    }
}

// ==================== GESTIÓN DE EMPLEADOS ====================
function abrirModalEmpleado(id = null) {
    empleadoEditando = id;
    const modal = document.getElementById('modalEmpleado');
    const titulo = document.getElementById('tituloModalEmpleado');
    
    if (id) {
        titulo.textContent = '✏️ Editar Empleado';
        const empleado = empleados.find(e => e.id === id);
        if (empleado) {
            document.getElementById('empleadoNombre').value = empleado.nombre;
            document.getElementById('empleadoCI').value = empleado.ci;
            document.getElementById('empleadoCargo').value = empleado.cargo;
            document.getElementById('empleadoDepartamento').value = empleado.departamento;
            document.getElementById('empleadoSalario').value = empleado.salarioBase;
            document.getElementById('empleadoFechaIngreso').value = empleado.fechaIngreso;
            document.getElementById('empleadoFechaNacimiento').value = empleado.fechaNacimiento || '';
            document.getElementById('empleadoPais').value = empleado.pais || 'bolivia';
            document.getElementById('empleadoAFP').value = empleado.afp || '';
            document.getElementById('empleadoMoneda').value = empleado.moneda || 'BOB';
            document.getElementById('empleadoEstado').value = empleado.estado;
            document.getElementById('empleadoEmail').value = empleado.email || '';
            document.getElementById('empleadoTelefono').value = empleado.telefono || '';
            document.getElementById('empleadoDireccion').value = empleado.direccion || '';
            mostrarOpcionesAFP();
        }
    } else {
        titulo.textContent = '➕ Nuevo Empleado';
        document.getElementById('formEmpleado').reset();
        document.getElementById('empleadoEstado').value = 'activo';
        document.getElementById('empleadoPais').value = 'bolivia';
        document.getElementById('empleadoMoneda').value = 'BOB';
    }
    
    cargarDepartamentosEnSelect('empleadoDepartamento');
    modal.classList.add('active');
}

function mostrarOpcionesAFP() {
    const pais = document.getElementById('empleadoPais').value;
    const grupoAFP = document.getElementById('grupoAFP');
    
    if (pais === 'chile') {
        grupoAFP.style.display = 'block';
    } else {
        grupoAFP.style.display = 'none';
        document.getElementById('empleadoAFP').value = '';
    }
}

function guardarEmpleado(event) {
    event.preventDefault();
    
    const empleado = {
        id: empleadoEditando || generarId(),
        nombre: document.getElementById('empleadoNombre').value,
        ci: document.getElementById('empleadoCI').value,
        cargo: document.getElementById('empleadoCargo').value,
        departamento: document.getElementById('empleadoDepartamento').value,
        salarioBase: parseFloat(document.getElementById('empleadoSalario').value),
        fechaIngreso: document.getElementById('empleadoFechaIngreso').value,
        fechaNacimiento: document.getElementById('empleadoFechaNacimiento').value,
        pais: document.getElementById('empleadoPais').value,
        afp: document.getElementById('empleadoAFP').value,
        moneda: document.getElementById('empleadoMoneda').value,
        estado: document.getElementById('empleadoEstado').value,
        email: document.getElementById('empleadoEmail').value,
        telefono: document.getElementById('empleadoTelefono').value,
        direccion: document.getElementById('empleadoDireccion').value
    };
    
    if (empleadoEditando) {
        const index = empleados.findIndex(e => e.id === empleadoEditando);
        empleados[index] = empleado;
    } else {
        empleados.push(empleado);
    }
    
    guardarDatos();
    cerrarModal('modalEmpleado');
    mostrarEmpleados();
    actualizarDashboard();
    
    mostrarNotificacion(empleadoEditando ? 'Empleado actualizado' : 'Empleado registrado', 'success');
}

function mostrarEmpleados() {
    const tbody = document.getElementById('listaEmpleados');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const empleadosFiltrados = empleados.filter(emp => {
        const busqueda = document.getElementById('buscarEmpleado')?.value.toLowerCase() || '';
        const filtroEstado = document.getElementById('filtroEstado')?.value || '';
        const filtroDpto = document.getElementById('filtroDepartamento')?.value || '';
        
        const cumpleBusqueda = emp.nombre.toLowerCase().includes(busqueda) ||
                              emp.ci.toLowerCase().includes(busqueda) ||
                              emp.cargo.toLowerCase().includes(busqueda);
        const cumpleEstado = !filtroEstado || emp.estado === filtroEstado;
        const cumpleDpto = !filtroDpto || emp.departamento === filtroDpto;
        
        return cumpleBusqueda && cumpleEstado && cumpleDpto;
    });
    
    empleadosFiltrados.forEach(empleado => {
        const dpto = departamentos.find(d => d.id === empleado.departamento);
        const afpTexto = empleado.pais === 'chile' && empleado.afp ? 
            AFP_CHILE[empleado.afp]?.nombre || 'No asignada' : '-';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${empleado.nombre}</td>
            <td>${empleado.ci}</td>
            <td>${empleado.cargo}</td>
            <td>${dpto ? dpto.nombre : 'Sin departamento'}</td>
            <td>${formatearMoneda(empleado.salarioBase, empleado.moneda)}</td>
            <td>${empleado.pais.charAt(0).toUpperCase() + empleado.pais.slice(1)}</td>
            <td>${afpTexto}</td>
            <td><span class="badge badge-${empleado.estado}">${empleado.estado}</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="abrirModalEmpleado('${empleado.id}')">✏️</button>
                <button class="btn-danger btn-small" onclick="eliminarEmpleado('${empleado.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarEmpleados() {
    mostrarEmpleados();
}

function eliminarEmpleado(id) {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
        empleados = empleados.filter(e => e.id !== id);
        guardarDatos();
        mostrarEmpleados();
        actualizarDashboard();
        mostrarNotificacion('Empleado eliminado', 'success');
    }
}

// ==================== GESTIÓN DE PAGOS ====================
function abrirModalPago() {
    const modal = document.getElementById('modalPago');
    document.getElementById('formPago').reset();
    cargarEmpleadosEnSelect('pagoEmpleado');
    establecerFechaActual();
    modal.classList.add('active');
}

function cargarDatosEmpleadoPago() {
    const empleadoId = document.getElementById('pagoEmpleado').value;
    if (!empleadoId) return;
    
    const empleado = empleados.find(e => e.id === empleadoId);
    if (empleado) {
        document.getElementById('pagoSalarioBruto').value = empleado.salarioBase;
        document.getElementById('pagoMoneda').value = empleado.moneda;
        
        // Calcular adelantos pendientes
        const adelantosPendientes = calcularAdelantosPendientes(empleadoId);
        document.getElementById('pagoAdelantos').value = adelantosPendientes.toFixed(2);
        
        actualizarCalculosPago();
    }
}

function actualizarCalculosPago() {
    const bruto = parseFloat(document.getElementById('pagoSalarioBruto').value) || 0;
    const bonos = parseFloat(document.getElementById('pagoBonos').value) || 0;
    const descuentosPorcentaje = parseFloat(document.getElementById('pagoDescuentos').value) || 0;
    const horasNocturnas = parseFloat(document.getElementById('pagoHorasNocturnas').value) || 0;
    const adelantosDesc = parseFloat(document.getElementById('pagoAdelantos').value) || 0;
    
    // Calcular descuentos
    const descuentos = bruto * (descuentosPorcentaje / 100);
    
    // Calcular recargo nocturno (50% adicional)
    const valorHora = bruto / 160; // Asumiendo 160 horas mensuales
    const recargoNocturno = valorHora * horasNocturnas * 0.5;
    
    // Calcular neto
    const salarioNeto = bruto + bonos + recargoNocturno - descuentos - adelantosDesc;
    
    const moneda = document.getElementById('pagoMoneda').value;
    document.getElementById('pagoSalarioNeto').textContent = formatearMoneda(salarioNeto, moneda);
}

function guardarPago(event) {
    event.preventDefault();
    
    const empleadoId = document.getElementById('pagoEmpleado').value;
    const empleado = empleados.find(e => e.id === empleadoId);
    
    const bruto = parseFloat(document.getElementById('pagoSalarioBruto').value) || 0;
    const bonos = parseFloat(document.getElementById('pagoBonos').value) || 0;
    const descuentosPorcentaje = parseFloat(document.getElementById('pagoDescuentos').value) || 0;
    const horasNocturnas = parseFloat(document.getElementById('pagoHorasNocturnas').value) || 0;
    const adelantosDesc = parseFloat(document.getElementById('pagoAdelantos').value) || 0;
    
    // Calcular valores
    const descuentos = bruto * (descuentosPorcentaje / 100);
    const valorHora = bruto / 160;
    const recargoNocturno = valorHora * horasNocturnas * 0.5;
    const salarioNeto = bruto + bonos + recargoNocturno - descuentos - adelantosDesc;
    
    const pago = {
        id: generarId(),
        empleadoId: empleadoId,
        empleadoNombre: empleado.nombre,
        fecha: document.getElementById('pagoFecha').value,
        salarioBruto: bruto,
        bonos: bonos,
        descuentos: descuentos,
        descuentosPorcentaje: descuentosPorcentaje,
        horasNocturnas: horasNocturnas,
        recargoNocturno: recargoNocturno,
        adelantos: adelantosDesc,
        salarioNeto: salarioNeto,
        moneda: document.getElementById('pagoMoneda').value,
        concepto: document.getElementById('pagoConcepto').value
    };
    
    pagos.push(pago);
    
    // Actualizar adelantos si hubo descuento
    if (adelantosDesc > 0) {
        actualizarAdelantosPorPago(empleadoId, adelantosDesc);
    }
    
    guardarDatos();
    cerrarModal('modalPago');
    mostrarPagos();
    actualizarDashboard();
    
    mostrarNotificacion('Pago registrado correctamente', 'success');
}

function mostrarPagos() {
    const tbody = document.getElementById('listaPagos');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const pagosFiltrados = pagos.filter(pago => {
        const busqueda = document.getElementById('buscarPago')?.value.toLowerCase() || '';
        const filtroMes = document.getElementById('filtroPagoMes')?.value || '';
        const filtroAnio = document.getElementById('filtroPagoAnio')?.value || '';
        
        const fecha = new Date(pago.fecha);
        const cumpleBusqueda = pago.empleadoNombre.toLowerCase().includes(busqueda);
        const cumpleMes = !filtroMes || (fecha.getMonth() + 1) === parseInt(filtroMes);
        const cumpleAnio = !filtroAnio || fecha.getFullYear() === parseInt(filtroAnio);
        
        return cumpleBusqueda && cumpleMes && cumpleAnio;
    });
    
    pagosFiltrados.reverse().forEach(pago => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatearFecha(pago.fecha)}</td>
            <td>${pago.empleadoNombre}</td>
            <td>${formatearMoneda(pago.salarioBruto, pago.moneda)}</td>
            <td>${formatearMoneda(pago.bonos, pago.moneda)}</td>
            <td>${formatearMoneda(pago.descuentos, pago.moneda)}</td>
            <td>${formatearMoneda(pago.adelantos, pago.moneda)}</td>
            <td><strong>${formatearMoneda(pago.salarioNeto, pago.moneda)}</strong></td>
            <td>${pago.moneda}</td>
            <td>
                <button class="btn-primary btn-small" onclick="verBoleta('${pago.id}')">📄</button>
                <button class="btn-danger btn-small" onclick="eliminarPago('${pago.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarPagos() {
    mostrarPagos();
}

function eliminarPago(id) {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
        pagos = pagos.filter(p => p.id !== id);
        guardarDatos();
        mostrarPagos();
        actualizarDashboard();
        mostrarNotificacion('Pago eliminado', 'success');
    }
}

function verBoleta(pagoId) {
    const pago = pagos.find(p => p.id === pagoId);
    if (!pago) return;
    
    const empleado = empleados.find(e => e.id === pago.empleadoId);
    const contenido = document.getElementById('contenidoBoleta');
    
    contenido.innerHTML = `
        <div class="boleta-header">
            <h2>BOLETA DE PAGO</h2>
            <p>Fecha: ${formatearFecha(pago.fecha)}</p>
        </div>
        
        <div class="boleta-section">
            <h4>DATOS DEL EMPLEADO</h4>
            <div class="boleta-row">
                <span>Nombre:</span>
                <span>${pago.empleadoNombre}</span>
            </div>
            <div class="boleta-row">
                <span>CI:</span>
                <span>${empleado?.ci || 'N/A'}</span>
            </div>
            <div class="boleta-row">
                <span>Cargo:</span>
                <span>${empleado?.cargo || 'N/A'}</span>
            </div>
        </div>
        
        <div class="boleta-section">
            <h4>INGRESOS</h4>
            <div class="boleta-row">
                <span>Salario Bruto:</span>
                <span>${formatearMoneda(pago.salarioBruto, pago.moneda)}</span>
            </div>
            <div class="boleta-row">
                <span>Bonos:</span>
                <span>${formatearMoneda(pago.bonos, pago.moneda)}</span>
            </div>
            ${pago.recargoNocturno > 0 ? `
            <div class="boleta-row">
                <span>Recargo Nocturno (${pago.horasNocturnas}h):</span>
                <span>${formatearMoneda(pago.recargoNocturno, pago.moneda)}</span>
            </div>` : ''}
        </div>
        
        <div class="boleta-section">
            <h4>DESCUENTOS</h4>
            <div class="boleta-row">
                <span>Descuentos (${pago.descuentosPorcentaje}%):</span>
                <span>${formatearMoneda(pago.descuentos, pago.moneda)}</span>
            </div>
            ${pago.adelantos > 0 ? `
            <div class="boleta-row">
                <span>Adelantos:</span>
                <span>${formatearMoneda(pago.adelantos, pago.moneda)}</span>
            </div>` : ''}
        </div>
        
        <div class="boleta-total">
            <div class="boleta-row">
                <span>SALARIO NETO:</span>
                <span>${formatearMoneda(pago.salarioNeto, pago.moneda)}</span>
            </div>
        </div>
        
        ${pago.concepto ? `
        <div class="boleta-section">
            <h4>NOTAS</h4>
            <p>${pago.concepto}</p>
        </div>` : ''}
    `;
    
    document.getElementById('modalBoleta').classList.add('active');
}

function imprimirBoleta() {
    window.print();
}

// ==================== GESTIÓN DE ADELANTOS ====================
function abrirModalAdelanto(id = null) {
    adelantoEditando = id;
    const modal = document.getElementById('modalAdelanto');
    const titulo = document.getElementById('tituloModalAdelanto');
    
    if (id) {
        titulo.textContent = '✏️ Editar Adelanto';
        const adelanto = adelantos.find(a => a.id === id);
        if (adelanto) {
            document.getElementById('adelantoEmpleado').value = adelanto.empleadoId;
            document.getElementById('adelantoMonto').value = adelanto.monto;
            document.getElementById('adelantoCuotas').value = adelanto.cuotas;
            document.getElementById('adelantoFecha').value = adelanto.fecha;
            document.getElementById('adelantoMoneda').value = adelanto.moneda;
            document.getElementById('adelantoMotivo').value = adelanto.motivo || '';
        }
    } else {
        titulo.textContent = '💸 Nuevo Adelanto';
        document.getElementById('formAdelanto').reset();
        document.getElementById('adelantoCuotas').value = '1';
        document.getElementById('adelantoMoneda').value = 'BOB';
    }
    
    cargarEmpleadosEnSelect('adelantoEmpleado');
    modal.classList.add('active');
}

function guardarAdelanto(event) {
    event.preventDefault();
    
    const empleadoId = document.getElementById('adelantoEmpleado').value;
    const empleado = empleados.find(e => e.id === empleadoId);
    
    const adelanto = {
        id: adelantoEditando || generarId(),
        empleadoId: empleadoId,
        empleadoNombre: empleado.nombre,
        monto: parseFloat(document.getElementById('adelantoMonto').value),
        montoPagado: adelantoEditando ? adelantos.find(a => a.id === adelantoEditando).montoPagado : 0,
        cuotas: parseInt(document.getElementById('adelantoCuotas').value),
        cuotasPagadas: adelantoEditando ? adelantos.find(a => a.id === adelantoEditando).cuotasPagadas : 0,
        fecha: document.getElementById('adelantoFecha').value,
        moneda: document.getElementById('adelantoMoneda').value,
        motivo: document.getElementById('adelantoMotivo').value,
        estado: adelantoEditando ? adelantos.find(a => a.id === adelantoEditando).estado : 'activo'
    };
    
    if (adelantoEditando) {
        const index = adelantos.findIndex(a => a.id === adelantoEditando);
        adelantos[index] = adelanto;
    } else {
        adelantos.push(adelanto);
    }
    
    guardarDatos();
    cerrarModal('modalAdelanto');
    mostrarAdelantos();
    actualizarEstadisticasAdelantos();
    
    mostrarNotificacion(adelantoEditando ? 'Adelanto actualizado' : 'Adelanto registrado', 'success');
}

function mostrarAdelantos() {
    const tbody = document.getElementById('listaAdelantos');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const adelantosFiltrados = adelantos.filter(adelanto => {
        const busqueda = document.getElementById('buscarAdelanto')?.value.toLowerCase() || '';
        const filtroEstado = document.getElementById('filtroEstadoAdelanto')?.value || '';
        
        const cumpleBusqueda = adelanto.empleadoNombre.toLowerCase().includes(busqueda);
        const cumpleEstado = !filtroEstado || adelanto.estado === filtroEstado;
        
        return cumpleBusqueda && cumpleEstado;
    });
    
    adelantosFiltrados.reverse().forEach(adelanto => {
        const saldoPendiente = adelanto.monto - adelanto.montoPagado;
        const progreso = (adelanto.montoPagado / adelanto.monto * 100).toFixed(0);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${adelanto.empleadoNombre}</td>
            <td>${formatearMoneda(adelanto.monto, adelanto.moneda)}</td>
            <td>${formatearMoneda(adelanto.montoPagado, adelanto.moneda)}</td>
            <td>${formatearMoneda(saldoPendiente, adelanto.moneda)}</td>
            <td>${adelanto.cuotasPagadas}/${adelanto.cuotas}</td>
            <td>${formatearFecha(adelanto.fecha)}</td>
            <td><span class="badge badge-${adelanto.estado}">${adelanto.estado}</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="abrirModalAdelanto('${adelanto.id}')">✏️</button>
                <button class="btn-danger btn-small" onclick="eliminarAdelanto('${adelanto.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarAdelantos() {
    mostrarAdelantos();
}

function eliminarAdelanto(id) {
    if (confirm('¿Estás seguro de eliminar este adelanto?')) {
        adelantos = adelantos.filter(a => a.id !== id);
        guardarDatos();
        mostrarAdelantos();
        actualizarEstadisticasAdelantos();
        mostrarNotificacion('Adelanto eliminado', 'success');
    }
}

function calcularAdelantosPendientes(empleadoId) {
    const adelantosEmpleado = adelantos.filter(a => a.empleadoId === empleadoId && a.estado === 'activo');
    let total = 0;
    
    adelantosEmpleado.forEach(adelanto => {
        const saldoPendiente = adelanto.monto - adelanto.montoPagado;
        const cuotaMensual = adelanto.monto / adelanto.cuotas;
        total += Math.min(cuotaMensual, saldoPendiente);
    });
    
    return total;
}

function actualizarAdelantosPorPago(empleadoId, montoDescontado) {
    const adelantosEmpleado = adelantos.filter(a => a.empleadoId === empleadoId && a.estado === 'activo');
    let montoRestante = montoDescontado;
    
    for (let adelanto of adelantosEmpleado) {
        if (montoRestante <= 0) break;
        
        const saldoPendiente = adelanto.monto - adelanto.montoPagado;
        const cuotaMensual = adelanto.monto / adelanto.cuotas;
        const pagoActual = Math.min(cuotaMensual, saldoPendiente, montoRestante);
        
        adelanto.montoPagado += pagoActual;
        adelanto.cuotasPagadas++;
        montoRestante -= pagoActual;
        
        if (adelanto.montoPagado >= adelanto.monto) {
            adelanto.estado = 'pagado';
        }
    }
    
    guardarDatos();
}

function actualizarEstadisticasAdelantos() {
    const activos = adelantos.filter(a => a.estado === 'activo');
    const pagados = adelantos.filter(a => a.estado === 'pagado');
    
    const montoTotal = activos.reduce((sum, a) => sum + a.monto, 0);
    const montoPendiente = activos.reduce((sum, a) => sum + (a.monto - a.montoPagado), 0);
    
    document.getElementById('totalAdelantosActivos').textContent = activos.length;
    document.getElementById('montoTotalAdelantos').textContent = formatearMoneda(montoTotal, 'BOB');
    document.getElementById('montoPendiente').textContent = formatearMoneda(montoPendiente, 'BOB');
    document.getElementById('adelantosPagados').textContent = pagados.length;
}

// ==================== GESTIÓN DE DEPARTAMENTOS ====================
function abrirModalDepartamento(id = null) {
    departamentoEditando = id;
    const modal = document.getElementById('modalDepartamento');
    const titulo = document.getElementById('tituloModalDepartamento');
    
    if (id) {
        titulo.textContent = '✏️ Editar Departamento';
        const dpto = departamentos.find(d => d.id === id);
        if (dpto) {
            document.getElementById('departamentoNombre').value = dpto.nombre;
            document.getElementById('departamentoDescripcion').value = dpto.descripcion || '';
        }
    } else {
        titulo.textContent = '🏢 Nuevo Departamento';
        document.getElementById('formDepartamento').reset();
    }
    
    modal.classList.add('active');
}

function guardarDepartamento(event) {
    event.preventDefault();
    
    const departamento = {
        id: departamentoEditando || generarId(),
        nombre: document.getElementById('departamentoNombre').value,
        descripcion: document.getElementById('departamentoDescripcion').value
    };
    
    if (departamentoEditando) {
        const index = departamentos.findIndex(d => d.id === departamentoEditando);
        departamentos[index] = departamento;
    } else {
        departamentos.push(departamento);
    }
    
    guardarDatos();
    cerrarModal('modalDepartamento');
    mostrarDepartamentos();
    mostrarEmpleados();
    
    mostrarNotificacion(departamentoEditando ? 'Departamento actualizado' : 'Departamento creado', 'success');
}

function mostrarDepartamentos() {
    const contenedor = document.getElementById('listaDepartamentos');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    departamentos.forEach(dpto => {
        const empleadosDpto = empleados.filter(e => e.departamento === dpto.id);
        
        const card = document.createElement('div');
        card.className = 'department-card';
        card.innerHTML = `
            <div class="department-header">
                <h3>${dpto.nombre}</h3>
                <div class="department-actions">
                    <button class="btn-primary btn-small" onclick="abrirModalDepartamento('${dpto.id}')">✏️</button>
                    <button class="btn-danger btn-small" onclick="eliminarDepartamento('${dpto.id}')">🗑️</button>
                </div>
            </div>
            <p class="text-muted">${dpto.descripcion || 'Sin descripción'}</p>
            <div class="department-employees">
                <strong>Empleados (${empleadosDpto.length}):</strong>
                ${empleadosDpto.map(e => `
                    <div class="employee-item">${e.nombre} - ${e.cargo}</div>
                `).join('') || '<div class="employee-item text-muted">Sin empleados asignados</div>'}
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function eliminarDepartamento(id) {
    const empleadosDpto = empleados.filter(e => e.departamento === id);
    
    if (empleadosDpto.length > 0) {
        alert('No puedes eliminar un departamento con empleados asignados');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este departamento?')) {
        departamentos = departamentos.filter(d => d.id !== id);
        guardarDatos();
        mostrarDepartamentos();
        mostrarNotificacion('Departamento eliminado', 'success');
    }
}

// ==================== GESTIÓN DE VACACIONES ====================
function abrirModalVacaciones(id = null) {
    vacacionEditando = id;
    const modal = document.getElementById('modalVacaciones');
    const titulo = document.getElementById('tituloModalVacaciones');
    
    if (id) {
        titulo.textContent = '✏️ Editar Vacaciones';
        const vacacion = vacaciones.find(v => v.id === id);
        if (vacacion) {
            document.getElementById('vacacionEmpleado').value = vacacion.empleadoId;
            document.getElementById('vacacionInicio').value = vacacion.fechaInicio;
            document.getElementById('vacacionFin').value = vacacion.fechaFin;
            document.getElementById('vacacionEstado').value = vacacion.estado;
            document.getElementById('vacacionMotivo').value = vacacion.motivo || '';
        }
    } else {
        titulo.textContent = '🌴 Registrar Vacaciones';
        document.getElementById('formVacaciones').reset();
        document.getElementById('vacacionEstado').value = 'pendiente';
    }
    
    cargarEmpleadosEnSelect('vacacionEmpleado');
    modal.classList.add('active');
}

function guardarVacaciones(event) {
    event.preventDefault();
    
    const empleadoId = document.getElementById('vacacionEmpleado').value;
    const empleado = empleados.find(e => e.id === empleadoId);
    const fechaInicio = document.getElementById('vacacionInicio').value;
    const fechaFin = document.getElementById('vacacionFin').value;
    
    const dias = calcularDiasEntreFechas(fechaInicio, fechaFin);
    
    const vacacion = {
        id: vacacionEditando || generarId(),
        empleadoId: empleadoId,
        empleadoNombre: empleado.nombre,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        dias: dias,
        estado: document.getElementById('vacacionEstado').value,
        motivo: document.getElementById('vacacionMotivo').value
    };
    
    if (vacacionEditando) {
        const index = vacaciones.findIndex(v => v.id === vacacionEditando);
        vacaciones[index] = vacacion;
    } else {
        vacaciones.push(vacacion);
    }
    
    guardarDatos();
    cerrarModal('modalVacaciones');
    mostrarVacaciones();
    renderizarCalendario();
    
    mostrarNotificacion(vacacionEditando ? 'Vacaciones actualizadas' : 'Vacaciones registradas', 'success');
}

function mostrarVacaciones() {
    const tbody = document.getElementById('listaVacaciones');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const vacacionesFiltradas = vacaciones.filter(vacacion => {
        const busqueda = document.getElementById('buscarVacacion')?.value.toLowerCase() || '';
        const filtroEstado = document.getElementById('filtroEstadoVacacion')?.value || '';
        
        const cumpleBusqueda = vacacion.empleadoNombre.toLowerCase().includes(busqueda);
        const cumpleEstado = !filtroEstado || vacacion.estado === filtroEstado;
        
        return cumpleBusqueda && cumpleEstado;
    });
    
    vacacionesFiltradas.reverse().forEach(vacacion => {
        const empleado = empleados.find(e => e.id === vacacion.empleadoId);
        const dpto = empleado ? departamentos.find(d => d.id === empleado.departamento) : null;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vacacion.empleadoNombre}</td>
            <td>${dpto ? dpto.nombre : 'N/A'}</td>
            <td>${formatearFecha(vacacion.fechaInicio)}</td>
            <td>${formatearFecha(vacacion.fechaFin)}</td>
            <td>${vacacion.dias} días</td>
            <td><span class="badge badge-${vacacion.estado}">${vacacion.estado}</span></td>
            <td>${vacacion.motivo || '-'}</td>
            <td>
                <button class="btn-primary btn-small" onclick="abrirModalVacaciones('${vacacion.id}')">✏️</button>
                <button class="btn-danger btn-small" onclick="eliminarVacacion('${vacacion.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarVacaciones() {
    mostrarVacaciones();
}

function eliminarVacacion(id) {
    if (confirm('¿Estás seguro de eliminar este registro de vacaciones?')) {
        vacaciones = vacaciones.filter(v => v.id !== id);
        guardarDatos();
        mostrarVacaciones();
        renderizarCalendario();
        mostrarNotificacion('Vacaciones eliminadas', 'success');
    }
}

// ==================== GESTIÓN DE LICENCIAS MÉDICAS ====================
function abrirModalLicencia(id = null) {
    licenciaEditando = id;
    const modal = document.getElementById('modalLicencia');
    const titulo = document.getElementById('tituloModalLicencia');
    
    if (id) {
        titulo.textContent = '✏️ Editar Licencia';
        const licencia = licencias.find(l => l.id === id);
        if (licencia) {
            document.getElementById('licenciaEmpleado').value = licencia.empleadoId;
            document.getElementById('licenciaInicio').value = licencia.fechaInicio;
            document.getElementById('licenciaFin').value = licencia.fechaFin;
            document.getElementById('licenciaEstado').value = licencia.estado;
            document.getElementById('licenciaDiagnostico').value = licencia.diagnostico || '';
        }
    } else {
        titulo.textContent = '🏥 Registrar Licencia';
        document.getElementById('formLicencia').reset();
        document.getElementById('licenciaEstado').value = 'activa';
    }
    
    cargarEmpleadosEnSelect('licenciaEmpleado');
    modal.classList.add('active');
}

function guardarLicencia(event) {
    event.preventDefault();
    
    const empleadoId = document.getElementById('licenciaEmpleado').value;
    const empleado = empleados.find(e => e.id === empleadoId);
    const fechaInicio = document.getElementById('licenciaInicio').value;
    const fechaFin = document.getElementById('licenciaFin').value;
    
    const dias = calcularDiasEntreFechas(fechaInicio, fechaFin);
    
    const licencia = {
        id: licenciaEditando || generarId(),
        empleadoId: empleadoId,
        empleadoNombre: empleado.nombre,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        dias: dias,
        estado: document.getElementById('licenciaEstado').value,
        diagnostico: document.getElementById('licenciaDiagnostico').value
    };
    
    if (licenciaEditando) {
        const index = licencias.findIndex(l => l.id === licenciaEditando);
        licencias[index] = licencia;
    } else {
        licencias.push(licencia);
    }
    
    guardarDatos();
    cerrarModal('modalLicencia');
    mostrarLicencias();
    renderizarCalendario();
    
    mostrarNotificacion(licenciaEditando ? 'Licencia actualizada' : 'Licencia registrada', 'success');
}

function mostrarLicencias() {
    const tbody = document.getElementById('listaLicencias');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const licenciasFiltradas = licencias.filter(licencia => {
        const busqueda = document.getElementById('buscarLicencia')?.value.toLowerCase() || '';
        const filtroEstado = document.getElementById('filtroEstadoLicencia')?.value || '';
        
        const cumpleBusqueda = licencia.empleadoNombre.toLowerCase().includes(busqueda);
        const cumpleEstado = !filtroEstado || licencia.estado === filtroEstado;
        
        return cumpleBusqueda && cumpleEstado;
    });
    
    licenciasFiltradas.reverse().forEach(licencia => {
        const empleado = empleados.find(e => e.id === licencia.empleadoId);
        const dpto = empleado ? departamentos.find(d => d.id === empleado.departamento) : null;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${licencia.empleadoNombre}</td>
            <td>${dpto ? dpto.nombre : 'N/A'}</td>
            <td>${formatearFecha(licencia.fechaInicio)}</td>
            <td>${formatearFecha(licencia.fechaFin)}</td>
            <td>${licencia.dias} días</td>
            <td><span class="badge badge-${licencia.estado}">${licencia.estado}</span></td>
            <td>${licencia.diagnostico || '-'}</td>
            <td>
                <button class="btn-primary btn-small" onclick="abrirModalLicencia('${licencia.id}')">✏️</button>
                <button class="btn-danger btn-small" onclick="eliminarLicencia('${licencia.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarLicencias() {
    mostrarLicencias();
}

function eliminarLicencia(id) {
    if (confirm('¿Estás seguro de eliminar este registro de licencia?')) {
        licencias = licencias.filter(l => l.id !== id);
        guardarDatos();
        mostrarLicencias();
        renderizarCalendario();
        mostrarNotificacion('Licencia eliminada', 'success');
    }
}

// ==================== CALCULADORA DE SALARIOS ====================
function mostrarCalculadoraSegunPais() {
    const pais = document.getElementById('calcPais').value;
    const calcGeneral = document.getElementById('calculadoraGeneral');
    const calcChile = document.getElementById('calculadoraChile');
    
    if (pais === 'chile') {
        calcGeneral.style.display = 'none';
        calcChile.style.display = 'block';
    } else {
        calcGeneral.style.display = 'block';
        calcChile.style.display = 'none';
    }
}

function calcularSalarioGeneral() {
    const bruto = parseFloat(document.getElementById('calcBruto').value) || 0;
    const bonos = parseFloat(document.getElementById('calcBonos').value) || 0;
    const descuentos = parseFloat(document.getElementById('calcDescuentos').value) || 0;
    const horasNocturnas = parseFloat(document.getElementById('calcHorasNocturnas').value) || 0;
    
    const descuentoMonto = bruto * (descuentos / 100);
    const valorHora = bruto / 160;
    const recargoNocturno = valorHora * horasNocturnas * 0.5;
    
    const salarioNeto = bruto + bonos + recargoNocturno - descuentoMonto;
    
    document.getElementById('resultadoGeneral').textContent = formatearMoneda(salarioNeto, 'BOB');
}

function cambiarModoCalculoChile() {
    const modo = document.getElementById('modoCalculoChile').value;
    const modoBrutoNeto = document.getElementById('modoBrutoNeto');
    const modoNetoBruto = document.getElementById('modoNetoBruto');
    
    if (modo === 'bruto-neto') {
        modoBrutoNeto.style.display = 'block';
        modoNetoBruto.style.display = 'none';
    } else {
        modoBrutoNeto.style.display = 'none';
        modoNetoBruto.style.display = 'block';
    }
}

function calcularSalarioChile() {
    const bruto = parseFloat(document.getElementById('calcChileBruto').value) || 0;
    const afpPorcentaje = parseFloat(document.getElementById('calcChileAFP').value) || 0;
    const saludPorcentaje = parseFloat(document.getElementById('calcChileSalud').value) || 0;
    const cesantiaPorcentaje = parseFloat(document.getElementById('calcChileCesantia').value) || 0;
    
    const afp = bruto * (afpPorcentaje / 100);
    const salud = bruto * (saludPorcentaje / 100);
    const cesantia = bruto * (cesantiaPorcentaje / 100);
    const totalDescuentos = afp + salud + cesantia;
    const salarioNeto = bruto - totalDescuentos;
    
    document.getElementById('detalleAFP').textContent = formatearMoneda(afp, 'CLP');
    document.getElementById('detalleSalud').textContent = formatearMoneda(salud, 'CLP');
    document.getElementById('detalleCesantia').textContent = formatearMoneda(cesantia, 'CLP');
    document.getElementById('detalleTotalDesc').textContent = formatearMoneda(totalDescuentos, 'CLP');
    document.getElementById('resultadoChile').textContent = formatearMoneda(salarioNeto, 'CLP');
}

function calcularSalarioInversoChile() {
    const netoDeseado = parseFloat(document.getElementById('calcChileNetoDeseado').value) || 0;
    const afpPorcentaje = parseFloat(document.getElementById('calcChileAFPInverso').value) || 0;
    const saludPorcentaje = parseFloat(document.getElementById('calcChileSaludInverso').value) || 0;
    const cesantiaPorcentaje = parseFloat(document.getElementById('calcChileCesantiaInverso').value) || 0;
    
    // Fórmula inversa: Bruto = Neto / (1 - (AFP% + Salud% + Cesantía%)/100)
    const porcentajeTotalDescuentos = afpPorcentaje + saludPorcentaje + cesantiaPorcentaje;
    const brutoNecesario = netoDeseado / (1 - (porcentajeTotalDescuentos / 100));
    
    const afp = brutoNecesario * (afpPorcentaje / 100);
    const salud = brutoNecesario * (saludPorcentaje / 100);
    const cesantia = brutoNecesario * (cesantiaPorcentaje / 100);
    const totalDescuentos = afp + salud + cesantia;
    
    document.getElementById('detalleAFPInverso').textContent = formatearMoneda(afp, 'CLP');
    document.getElementById('detalleSaludInverso').textContent = formatearMoneda(salud, 'CLP');
    document.getElementById('detalleCesantiaInverso').textContent = formatearMoneda(cesantia, 'CLP');
    document.getElementById('detalleTotalDescInverso').textContent = formatearMoneda(totalDescuentos, 'CLP');
    document.getElementById('resultadoChileInverso').textContent = formatearMoneda(brutoNecesario, 'CLP');
}

// ==================== CALENDARIO ====================
function renderizarCalendario() {
    const contenedor = document.getElementById('calendarioVista');
    if (!contenedor) return;
    
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    document.getElementById('mesCalendario').textContent = `${nombresMeses[mesActual]} ${anioActual}`;
    
    const primerDia = new Date(anioActual, mesActual, 1).getDay();
    const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
    
    let html = '<div class="calendar-grid">';
    
    // Encabezados
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(dia => {
        html += `<div class="calendar-day-header">${dia}</div>`;
    });
    
    // Días vacíos antes del primer día
    for (let i = 0; i < primerDia; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }
    
    // Días del mes
    const hoy = new Date();
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(anioActual, mesActual, dia);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        const esHoy = fecha.getDate() === hoy.getDate() && 
                      fecha.getMonth() === hoy.getMonth() && 
                      fecha.getFullYear() === hoy.getFullYear();
        
        // Buscar eventos
        const pagosDia = pagos.filter(p => p.fecha === fechaStr);
        const cumpleanosDia = empleados.filter(e => {
            if (!e.fechaNacimiento) return false;
            const cumple = new Date(e.fechaNacimiento);
            return cumple.getDate() === dia && cumple.getMonth() === mesActual;
        });
        const vacacionesDia = vacaciones.filter(v => {
            const inicio = new Date(v.fechaInicio);
            const fin = new Date(v.fechaFin);
            return fecha >= inicio && fecha <= fin;
        });
        const licenciasDia = licencias.filter(l => {
            const inicio = new Date(l.fechaInicio);
            const fin = new Date(l.fechaFin);
            return fecha >= inicio && fecha <= fin;
        });
        
        html += `
            <div class="calendar-day ${esHoy ? 'today' : ''}">
                <div class="calendar-day-number">${dia}</div>
                <div class="calendar-events">
                    ${pagosDia.length > 0 ? '<div class="calendar-event-dot dot pago"></div>' : ''}
                    ${cumpleanosDia.length > 0 ? '<div class="calendar-event-dot dot cumpleanos"></div>' : ''}
                    ${vacacionesDia.length > 0 ? '<div class="calendar-event-dot dot vacacion"></div>' : ''}
                    ${licenciasDia.length > 0 ? '<div class="calendar-event-dot dot licencia"></div>' : ''}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    contenedor.innerHTML = html;
}

function mesAnterior() {
    mesActual--;
    if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
    }
    renderizarCalendario();
}

function mesSiguiente() {
    mesActual++;
    if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
    }
    renderizarCalendario();
}

// ==================== DASHBOARD ====================
function actualizarDashboard() {
    const mes = parseInt(document.getElementById('dashboardMes')?.value || new Date().getMonth() + 1);
    const anio = parseInt(document.getElementById('dashboardAnio')?.value || new Date().getFullYear());
    
    // Estadísticas generales
    const empleadosActivos = empleados.filter(e => e.estado === 'activo').length;
    document.getElementById('totalEmpleados').textContent = empleadosActivos;
    
    // Pagos del mes
    const pagosMes = pagos.filter(p => {
        const fecha = new Date(p.fecha);
        return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
    });
    
    const totalPagosMes = pagosMes.reduce((sum, p) => sum + p.salarioNeto, 0);
    document.getElementById('totalPagosMes').textContent = formatearMoneda(totalPagosMes, 'BOB');
    
    // Adelantos
    const adelantosActivos = adelantos.filter(a => a.estado === 'activo').length;
    document.getElementById('totalAdelantos').textContent = adelantosActivos;
    
    // Departamentos
    document.getElementById('totalDepartamentos').textContent = departamentos.length;
    
    // Tabla de resumen
    const tbody = document.getElementById('tablaDashboard');
    if (tbody) {
        tbody.innerHTML = '';
        
        pagosMes.forEach(pago => {
            const empleado = empleados.find(e => e.id === pago.empleadoId);
            const dpto = empleado ? departamentos.find(d => d.id === empleado.departamento) : null;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pago.empleadoNombre}</td>
                <td>${dpto ? dpto.nombre : 'N/A'}</td>
                <td>${empleado ? empleado.cargo : 'N/A'}</td>
                <td>${formatearMoneda(pago.salarioBruto, pago.moneda)}</td>
                <td>${formatearMoneda(pago.descuentos, pago.moneda)}</td>
                <td>${formatearMoneda(pago.adelantos, pago.moneda)}</td>
                <td><strong>${formatearMoneda(pago.salarioNeto, pago.moneda)}</strong></td>
                <td>${formatearFecha(pago.fecha)}</td>
            `;
            tbody.appendChild(tr);
        });
        
        if (pagosMes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay pagos registrados este mes</td></tr>';
        }
    }
}

// ==================== REPORTES ====================
function inicializarReportes() {
    cargarDepartamentosEnSelect('reporteDpto');
    
    // Llenar selector de años
    const anios = [...new Set(pagos.map(p => new Date(p.fecha).getFullYear()))];
    const selectAnio = document.getElementById('reporteAnio');
    if (selectAnio) {
        selectAnio.innerHTML = '';
        anios.sort((a, b) => b - a).forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        });
    }
}

function generarReporteDepartamento() {
    const dptoId = document.getElementById('reporteDpto').value;
    if (!dptoId) return;
    
    const dpto = departamentos.find(d => d.id === dptoId);
    const empleadosDpto = empleados.filter(e => e.departamento === dptoId);
    const pagosDpto = pagos.filter(p => empleadosDpto.some(e => e.id === p.empleadoId));
    
    const totalPagado = pagosDpto.reduce((sum, p) => sum + p.salarioNeto, 0);
    
    const resultado = document.getElementById('resultadoReporteDpto');
    resultado.innerHTML = `
        <h4>${dpto.nombre}</h4>
        <p><strong>Total Empleados:</strong> ${empleadosDpto.length}</p>
        <p><strong>Total Pagado:</strong> ${formatearMoneda(totalPagado, 'BOB')}</p>
        <p><strong>Promedio por Empleado:</strong> ${formatearMoneda(totalPagado / empleadosDpto.length || 0, 'BOB')}</p>
    `;
}

function generarReporteCargo() {
    const cargo = document.getElementById('reporteCargo').value.toLowerCase();
    if (!cargo) return;
    
    const empleadosCargo = empleados.filter(e => e.cargo.toLowerCase().includes(cargo));
    const pagosCargo = pagos.filter(p => empleadosCargo.some(e => e.id === p.empleadoId));
    
    const totalPagado = pagosCargo.reduce((sum, p) => sum + p.salarioNeto, 0);
    
    const resultado = document.getElementById('resultadoReporteCargo');
    resultado.innerHTML = `
        <h4>Reporte: ${cargo}</h4>
        <p><strong>Empleados con este cargo:</strong> ${empleadosCargo.length}</p>
        <p><strong>Total Pagado:</strong> ${formatearMoneda(totalPagado, 'BOB')}</p>
        <p><strong>Promedio:</strong> ${formatearMoneda(totalPagado / empleadosCargo.length || 0, 'BOB')}</p>
    `;
}

function generarReporteMensual() {
    const mes = parseInt(document.getElementById('reporteMes').value);
    const anio = parseInt(document.getElementById('reporteAnio').value);
    
    const pagosMes = pagos.filter(p => {
        const fecha = new Date(p.fecha);
        return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
    });
    
    const totalPagado = pagosMes.reduce((sum, p) => sum + p.salarioNeto, 0);
    const totalBruto = pagosMes.reduce((sum, p) => sum + p.salarioBruto, 0);
    const totalDescuentos = pagosMes.reduce((sum, p) => sum + p.descuentos + p.adelantos, 0);
    
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const resultado = document.getElementById('resultadoReporteMensual');
    resultado.innerHTML = `
        <h4>Reporte: ${nombresMeses[mes - 1]} ${anio}</h4>
        <p><strong>Total Pagos Registrados:</strong> ${pagosMes.length}</p>
        <p><strong>Total Bruto:</strong> ${formatearMoneda(totalBruto, 'BOB')}</p>
        <p><strong>Total Descuentos:</strong> ${formatearMoneda(totalDescuentos, 'BOB')}</p>
        <p><strong>Total Neto Pagado:</strong> ${formatearMoneda(totalPagado, 'BOB')}</p>
    `;
}

function exportarReporteDpto() {
    const dptoId = document.getElementById('reporteDpto').value;
    if (!dptoId) return;
    
    const dpto = departamentos.find(d => d.id === dptoId);
    const empleadosDpto = empleados.filter(e => e.departamento === dptoId);
    const pagosDpto = pagos.filter(p => empleadosDpto.some(e => e.id === p.empleadoId));
    
    let csv = 'Empleado,Fecha,Salario Bruto,Descuentos,Salario Neto,Moneda\n';
    pagosDpto.forEach(p => {
        csv += `${p.empleadoNombre},${p.fecha},${p.salarioBruto},${p.descuentos},${p.salarioNeto},${p.moneda}\n`;
    });
    
    descargarCSV(csv, `reporte_${dpto.nombre}.csv`);
}

function exportarReporteMensual() {
    const mes = parseInt(document.getElementById('reporteMes').value);
    const anio = parseInt(document.getElementById('reporteAnio').value);
    
    const pagosMes = pagos.filter(p => {
        const fecha = new Date(p.fecha);
        return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
    });
    
    let csv = 'Empleado,Fecha,Salario Bruto,Bonos,Descuentos,Adelantos,Salario Neto,Moneda\n';
    pagosMes.forEach(p => {
        csv += `${p.empleadoNombre},${p.fecha},${p.salarioBruto},${p.bonos},${p.descuentos},${p.adelantos},${p.salarioNeto},${p.moneda}\n`;
    });
    
    const nombresMeses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    descargarCSV(csv, `reporte_${nombresMeses[mes - 1]}_${anio}.csv`);
}

// ==================== EXPORTAR/IMPORTAR DATOS ====================
function exportarDatos() {
    const datos = {
        empleados,
        pagos,
        adelantos,
        departamentos,
        vacaciones,
        licencias,
        fecha: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nomina_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    mostrarNotificacion('Datos exportados correctamente', 'success');
}

function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            if (confirm('¿Estás seguro de importar estos datos? Se reemplazarán todos los datos actuales.')) {
                empleados = datos.empleados || [];
                pagos = datos.pagos || [];
                adelantos = datos.adelantos || [];
                departamentos = datos.departamentos || [];
                vacaciones = datos.vacaciones || [];
                licencias = datos.licencias || [];
                
                guardarDatos();
                
                // Actualizar todas las vistas
                mostrarEmpleados();
                mostrarPagos();
                mostrarAdelantos();
                mostrarDepartamentos();
                mostrarVacaciones();
                mostrarLicencias();
                actualizarDashboard();
                renderizarCalendario();
                
                mostrarNotificacion('Datos importados correctamente', 'success');
            }
        } catch (error) {
            alert('Error al importar los datos: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ==================== CONFIGURACIÓN Y TEMAS ====================
function abrirConfiguracion() {
    document.getElementById('modalConfiguracion').classList.add('active');
}

function cambiarTema() {
    const temaActual = document.documentElement.getAttribute('data-theme');
    const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
    aplicarTema(nuevoTema);
}

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema);
}

function limpiarDatos() {
    if (confirm('⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos del sistema.\n\n¿Estás completamente seguro?')) {
        if (confirm('Esta es la última confirmación. Los datos no se podrán recuperar. ¿Continuar?')) {
            empleados = [];
            pagos = [];
            adelantos = [];
            departamentos = [];
            vacaciones = [];
            licencias = [];
            
            guardarDatos();
            
            // Reinicializar datos de demostración
            inicializarDatosDemostracion();
            
            // Actualizar todas las vistas
            mostrarEmpleados();
            mostrarPagos();
            mostrarAdelantos();
            mostrarDepartamentos();
            mostrarVacaciones();
            mostrarLicencias();
            actualizarDashboard();
            renderizarCalendario();
            
            cerrarModal('modalConfiguracion');
            mostrarNotificacion('Todos los datos han sido eliminados', 'success');
        }
    }
}

// ==================== FUNCIONES AUXILIARES ====================
function cerrarModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function guardarDatos() {
    localStorage.setItem('empleados', JSON.stringify(empleados));
    localStorage.setItem('pagos', JSON.stringify(pagos));
    localStorage.setItem('adelantos', JSON.stringify(adelantos));
    localStorage.setItem('departamentos', JSON.stringify(departamentos));
    localStorage.setItem('vacaciones', JSON.stringify(vacaciones));
    localStorage.setItem('licencias', JSON.stringify(licencias));
}

function formatearMoneda(valor, moneda = 'BOB') {
    const simbolos = {
        'BOB': 'Bs',
        'USD': '$',
        'CLP': '$',
        'ARS': '$',
        'PEN': 'S/',
        'COP': '$',
        'EUR': '€',
        'BRL': 'R$',
        'MXN': '$'
    };
    
    const valorFormateado = new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
    
    return `${simbolos[moneda] || moneda} ${valorFormateado}`;
}

function formatearFecha(fecha) {
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-BO', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

function calcularDiasEntreFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T00:00:00');
    const diferencia = fin - inicio;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1;
}

function descargarCSV(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
}

function cargarEmpleadosEnSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const empleadosActivos = empleados.filter(e => e.estado === 'activo');
    
    select.innerHTML = '<option value="">Seleccionar empleado...</option>';
    empleadosActivos.forEach(empleado => {
        const option = document.createElement('option');
        option.value = empleado.id;
        option.textContent = `${empleado.nombre} - ${empleado.cargo}`;
        select.appendChild(option);
    });
}

function cargarDepartamentosEnSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const opcionActual = select.value;
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    departamentos.forEach(dpto => {
        const option = document.createElement('option');
        option.value = dpto.id;
        option.textContent = dpto.nombre;
        select.appendChild(option);
    });
    
    if (opcionActual) {
        select.value = opcionActual;
    }
}

function inicializarSelectores() {
    // Selector de mes dashboard
    const mesActual = new Date().getMonth() + 1;
    const selectMes = document.getElementById('dashboardMes');
    if (selectMes) {
        selectMes.value = mesActual;
    }
    
    // Selector de año dashboard
    const anioActual = new Date().getFullYear();
    const selectAnio = document.getElementById('dashboardAnio');
    if (selectAnio) {
        selectAnio.innerHTML = '';
        for (let i = anioActual - 2; i <= anioActual + 1; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === anioActual) option.selected = true;
            selectAnio.appendChild(option);
        }
    }
    
    // Selector de año filtro pagos
    const selectAnioPagos = document.getElementById('filtroPagoAnio');
    if (selectAnioPagos) {
        selectAnioPagos.innerHTML = '<option value="">Todos los años</option>';
        for (let i = anioActual - 2; i <= anioActual + 1; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectAnioPagos.appendChild(option);
        }
    }
    
    // Llenar filtro de departamentos
    cargarDepartamentosEnSelect('filtroDepartamento');
}

function establecerFechaActual() {
    const hoy = new Date().toISOString().split('T')[0];
    
    const campos = ['pagoFecha', 'adelantoFecha'];
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo && !campo.value) {
            campo.value = hoy;
        }
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Simple implementación de notificación
    const colores = {
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'info': '#3B82F6'
    };
    
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ==================== ESTILOS PARA ANIMACIONES ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Sistema de Nómina v3.0 - JavaScript cargado completamente');
