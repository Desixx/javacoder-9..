class Plan {
    constructor(id, nombre, precioBase, descripcion, ventajas) {
        this.id = id;
        this.nombre = nombre;
        this.precioBase = precioBase;
        this.descripcion = descripcion;
        this.ventajas = ventajas;
    }
}

let listaDePlanes = [];
let planSeleccionado = null;
let adicionalesSeleccionados = [];
let mesesContratacion = 1;

const contenedorPlanes = document.getElementById("contenedor-planes");
const seccionExtras = document.getElementById("seccion-extras");
const contenedorExtras = document.querySelectorAll(".input-extra");
const selectMeses = document.getElementById("select-meses");
const resumenCarrito = document.getElementById("resumen-carrito");
const desglosePrecio = document.getElementById("desglose-precio");
const btnContratar = document.getElementById("btn-contratar");
const mensajeEstado = document.getElementById("mensaje-estado");

setTimeout(() => {
    mostrarMensajeEstado("👋 ¡Bienvenido al simulador de contratación interactivo!");
}, 2000);

const mostrarMensajeEstado = (textoMensaje) => {
    if (mensajeEstado) {
        mensajeEstado.textContent = textoMensaje;
    }
};

const obtenerPlanesSimulados = () => {
    return new Promise((resolve, reject) => {
        mostrarMensajeEstado("⏳ Cargando productos...");
        setTimeout(() => {
            const exitoCarga = true;
            if (exitoCarga) {
                const planesIniciales = [
                    new Plan(1, "Plan Básico", 1200, "Ideal para emprendedores que recién empiezan.", "Incluye soporte por email, acceso a funciones esenciales."),
                    new Plan(2, "Plan Intermedio", 2400, "Para negocios en crecimiento constante.", "Incluye soporte prioritario, herramientas avanzadas."),
                    new Plan(3, "Plan Premium", 4000, "Acceso total sin límites corporativos.", "Incluye soporte 24/7, asesoramiento personalizado.")
                ];
                resolve(planesIniciales);
            } else {
                reject("No se pudo procesar la operación, intentá de nuevo");
            }
        }, 1500);
    });
};

const inicializarSimulador = async () => {
    try {
        const datosGuardados = localStorage.getItem("planes_v2");
        if (datosGuardados) {
            listaDePlanes = JSON.parse(datosGuardados);
            mostrarMensajeEstado(`✔️ ${listaDePlanes.length} productos cargados`);
        } else {
            listaDePlanes = await obtenerPlanesSimulados();
            localStorage.setItem("planes_v2", JSON.stringify(listaDePlanes));
            mostrarMensajeEstado(`✔️ ${listaDePlanes.length} productos cargados`);
        }
    } catch (errorCapturado) {
        mostrarMensajeEstado(`⚠️ ${errorCapturado}`);
        listaDePlanes = [];
    } finally {
        renderizarPlanes(listaDePlanes);
    }
};

const renderizarPlanes = (planesAgesionar) => {
    if (!contenedorPlanes) return;
    contenedorPlanes.innerHTML = ``;

    if (planesAgesionar.length === 0) {
        contenedorPlanes.innerHTML = `<p>No hay planes disponibles para mostrar.</p>`;
        return;
    }

    planesAgesionar.forEach(unPlan => {
        const { id, nombre, precioBase, descripcion, ventajas } = unPlan;

        const tarjeta = document.createElement("div");
        tarjeta.className = `plan-card`;

        tarjeta.innerHTML = `
            <div class="plan-info">
                <h3>${nombre}</h3>
                <p class="plan-desc"><strong>Descripción:</strong> ${descripcion}</p>
                <p class="plan-ventajas"><strong>Ventajas:</strong> ${ventajas}</p>
                <p class="plan-precio"><strong>Precio base mensual:</strong> $${precioBase}</p>
            </div>
            <div class="acciones-tarjeta">
                <button class="btn-seleccionar">Elegir Plan</button>
            </div>
        `;

        tarjeta.querySelector(".btn-seleccionar").addEventListener("click", () => {
            manejarSeleccionPlan(unPlan);
        });

        contenedorPlanes.appendChild(tarjeta);
    });
};

const manejarSeleccionPlan = (unPlan) => {
    try {
        planSeleccionado = unPlan;
        seccionExtras.style.display = "block";
        adicionalesSeleccionados = [];
        mesesContratacion = 1;
        if (selectMeses) selectMeses.value = "1";
        contenedorExtras.forEach(checkbox => checkbox.checked = false);
        actualizarCarrito();
    } catch (errorCapturado) {
        mostrarMensajeEstado("⚠️ No se pudo procesar la operación, intentá de nuevo");
    }
};

const procesarCambioAdicionales = () => {
    try {
        adicionalesSeleccionados = [];
        contenedorExtras.forEach(item => {
            if (item.checked) {
                adicionalesSeleccionados.push({
                    nombre: item.getAttribute("data-nombre"),
                    precio: parseFloat(item.value)
                });
            }
        });
        actualizarCarrito();
    } catch (errorCapturado) {
        mostrarMensajeEstado("⚠️ No se pudo procesar la operación, intentá de nuevo");
    }
};

contenedorExtras.forEach(checkbox => {
    checkbox.addEventListener("change", procesarCambioAdicionales);
});

if (selectMeses) {
    selectMeses.addEventListener("change", (eventoPlazo) => {
        mesesContratacion = parseInt(eventoPlazo.target.value);
        actualizarCarrito();
    });
}

const calcularDescuentoPorPlazo = (subtotalBruto, meses) => {
    // Ejemplo de uso de switch estricto y limpio, llamando funciones y sin lógica interna saturada
    switch (meses) {
        case 6:
            return subtotalBruto * 0.10;
        case 12:
            return subtotalBruto * 0.20;
        default:
            return 0;
    }
};

const construirListaAdicionalesHTML = () => {
    if (adicionalesSeleccionados.length === 0) {
        return "<li>Sin adicionales seleccionados</li>";
    }
    let htmlGenerado = "";
    adicionalesSeleccionados.forEach(adicional => {
        htmlGenerado += `<li>${adicional.nombre}: +$${adicional.precio}/mes</li>`;
    });
    return htmlGenerado;
};

const actualizarCarrito = () => {
    if (!planSeleccionado) return;

    let totalAdicionales = 0;
    adicionalesSeleccionados.forEach(adicional => {
        totalAdicionales += adicional.precio;
    });

    let subtotalMensual = planSeleccionado.precioBase + totalAdicionales;
    let subtotalBruto = subtotalMensual * mesesContratacion;
    let descuento = calcularDescuentoPorPlazo(subtotalBruto, mesesContratacion);
    let precioFinalTotal = subtotalBruto - descuento;

    resumenCarrito.innerHTML = `
        <p><strong>Plan Elegido:</strong> ${planSeleccionado.nombre} ($${planSeleccionado.precioBase}/mes)</p>
        <p><strong>Plazo:</strong> ${mesesContratacion} mes(es)</p>
        <p><strong>Adicionales:</strong></p>
        <ul>${construirListaAdicionalesHTML()}</ul>
        ${descuento > 0 ? `<p><strong>Descuento aplicado:</strong> -$${descuento.toFixed(0)}</p>` : ''}
    `;

    desglosePrecio.textContent = `Precio Final Total: $${precioFinalTotal.toFixed(0)}`;
    btnContratar.style.display = "block";
};

const confirmarAltaServicio = () => {
    try {
        if (!planSeleccionado) {
            throw new Error("No se pudo procesar la operación, intentá de nuevo");
        }

        mostrarMensajeEstado(`🎉 ¡Alta exitosa del servicio "${planSeleccionado.nombre}" por ${mesesContratacion} mes(es)! Gracias por tu contratación.`);

        planSeleccionado = null;
        adicionalesSeleccionados = [];
        seccionExtras.style.display = "none";
        resumenCarrito.innerHTML = `<p>Contratación finalizada con éxito.</p>`;
        desglosePrecio.textContent = "";
        btnContratar.style.display = "none";
        contenedorExtras.forEach(item => item.checked = false);
    } catch (errorCapturado) {
        mostrarMensajeEstado(`⚠️ ${errorCapturado.message}`);
    }
};

btnContratar.addEventListener("click", confirmarAltaServicio);

inicializarSimulador();