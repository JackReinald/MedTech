// app.js (Inicio del archivo)

let citas = [];
let notificaciones = [];

// === CLAVES DE PERSISTENCIA ===
const LOCAL_STORAGE_KEY = "medtechCitas";
const NOTIF_STORAGE_KEY = "medtechNotifs";

// === ARRAYS PARA SIMULAR LA BASE DE DATOS ===
const medicos = [
  {
    id: 101,
    nombre: "Dra. Ana Torres",
    especialidad: "Medicina General",
    zona: "Florencia",
  },
  {
    id: 102,
    nombre: "Dr. Luis Gómez",
    especialidad: "Medicina General",
    zona: "norte",
  },
  {
    id: 201,
    nombre: "Dra. Carla Díaz",
    especialidad: "Pediatría",
    zona: "Florencia",
  },
  {
    id: 301,
    nombre: "Dr. Javier Pérez",
    especialidad: "Odontología",
    zona: "sur",
  },
  {
    id: 401,
    nombre: "Lic. Marta Vega",
    especialidad: "Psicología",
    zona: "Florencia",
  },
];

const disponibilidadBase = [
  // Lunes (1) de 09:00 a 11:00
  { medicoId: 101, diaSemana: 1, horaInicio: "09:00", horaFin: "11:00" },
  // Miércoles (3) de 14:00 a 16:00
  { medicoId: 101, diaSemana: 3, horaInicio: "14:00", horaFin: "16:00" },
  // Viernes (5) de 16:00 a 18:00
  { medicoId: 102, diaSemana: 5, horaInicio: "16:00", horaFin: "19:00" },
  // Martes (2) de 11:00 a 13:00
  { medicoId: 201, diaSemana: 2, horaInicio: "11:00", horaFin: "13:00" },
];

const DURACION_CITA_MINUTOS = 30;

// app.js (Cerca de las otras variables DOM: form, lista, mensaje, notifCountElement)

const notifBellContainer = document.getElementById("notif-bell");
const notifPanel = document.getElementById("notif-panel");
const notifListElement = document.getElementById("notif-list");
const btnMarkAllRead = document.getElementById("mark-all-read");

/**
 * Renderiza la lista de notificaciones en el panel.
 */
function renderNotificaciones() {
  notifListElement.innerHTML = "";

  if (notificaciones.length === 0) {
    notifListElement.innerHTML = "<li>No tienes notificaciones.</li>";
    return;
  }

  notificaciones.forEach((notif) => {
    const li = document.createElement("li");
    const formattedTime = new Date(notif.fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    li.classList.add(notif.leida ? "read" : "unread");
    li.innerHTML = `[${formattedTime}] ${notif.mensaje}`;
    notifListElement.appendChild(li);
  });
}

// app.js (Nuevo Event Listener para cerrar el panel al hacer clic en el body)

document.addEventListener("click", (e) => {
  const isBell = notifBellContainer.contains(e.target);
  const isPanel = notifPanel.contains(e.target);

  // Si el clic NO fue en la campana Y NO fue dentro del panel, entonces lo cerramos.
  if (!isBell && !isPanel && notifPanel.classList.contains("visible")) {
    notifPanel.classList.remove("visible");
  }
});

// app.js (Event Listeners para el botón de Notificaciones)

// 1. Mostrar/Ocultar el panel de notificaciones al hacer clic en la campana
notifBellContainer.addEventListener("click", () => {
  // Alterna la clase 'visible'
  notifPanel.classList.toggle("visible");

  // Si se hace visible, actualiza la lista.
  if (notifPanel.classList.contains("visible")) {
    renderNotificaciones();
  }
});

// 2. Marcar todas las notificaciones como leídas
btnMarkAllRead.addEventListener("click", () => {
  // Modificar el estado en el array
  notificaciones = notificaciones.map((n) => ({ ...n, leida: true }));

  // Guardar cambios y actualizar la UI
  saveNotificaciones();
  updateNotifCount();
  renderNotificaciones();
});

// ===================================================

const form = document.getElementById("form-cita");
const lista = document.getElementById("lista-citas");
const mensaje = document.getElementById("mensaje");
const notifCountElement = document.getElementById("notif-count"); // Elemento del contador de notificaciones

// === FUNCIONES DE PERSISTENCIA DE CITAS ===

function saveCitas() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(citas));
}

function loadCitas() {
  const storedCitas = localStorage.getItem(LOCAL_STORAGE_KEY);
  citas = storedCitas ? JSON.parse(storedCitas) : [];
}

// === FUNCIONES DE PERSISTENCIA Y LÓGICA DE NOTIFICACIONES ===

function saveNotificaciones() {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notificaciones));
}

function loadNotificaciones() {
  const storedNotifs = localStorage.getItem(NOTIF_STORAGE_KEY);
  notificaciones = storedNotifs ? JSON.parse(storedNotifs) : [];
  updateNotifCount();
}

function updateNotifCount() {
  // Cuenta solo las notificaciones que no han sido leídas
  const count = notificaciones.filter((n) => !n.leida).length;
  notifCountElement.textContent = count;
  // Muestra/oculta el badge si hay notificaciones
  notifCountElement.style.display = count > 0 ? "block" : "none";
}

function addNotificacion(mensaje, tipo) {
  const notif = {
    id: Date.now(),
    mensaje: mensaje,
    tipo: tipo,
    leida: false,
    fecha: new Date().toISOString(),
  };
  notificaciones.unshift(notif);
  saveNotificaciones();
  updateNotifCount();
}

// === LÓGICA DE DISPONIBILIDAD Y ZONA HORARIA ===

/**
 * Redondea la fecha/hora al inicio del bloque de 30 minutos más cercano y anterior (09:35 -> 09:30).
 */
function ajustarHoraAlBloque(fecha) {
  const minutos = fecha.getMinutes();
  const minutosAjustados =
    Math.floor(minutos / DURACION_CITA_MINUTOS) * DURACION_CITA_MINUTOS;

  // Crea una nueva fecha/hora con los minutos redondeados y segundos/milisegundos a cero
  fecha.setMinutes(minutosAjustados, 0, 0);
  return fecha;
}

/**
 * Verifica la disponibilidad del médico y estandariza la hora.
 */
function verificarDisponibilidad(especialidad, zona, fechaHora) {
  let fechaCita = new Date(fechaHora);
  const diaCita = fechaCita.getDay();

  // PASO 1: Estandarizar la hora al bloque.
  fechaCita = ajustarHoraAlBloque(fechaCita);

  // PASO 2: Construir el string localmente (SOLUCIÓN ZONA HORARIA)
  const year = fechaCita.getFullYear();
  const month = String(fechaCita.getMonth() + 1).padStart(2, "0");
  const day = String(fechaCita.getDate()).padStart(2, "0");
  const hours = String(fechaCita.getHours()).padStart(2, "0");
  const minutes = String(fechaCita.getMinutes()).padStart(2, "0");

  const fechaHoraEstandarizada = `${year}-${month}-${day}T${hours}:${minutes}`;

  const horaCitaMinutos = fechaCita.getHours() * 60 + fechaCita.getMinutes();
  const horaFinCitaMinutos = horaCitaMinutos + DURACION_CITA_MINUTOS;

  // 1. Filtrar Médicos por especialidad y zona
  const medicosFiltrados = medicos.filter(
    (m) => m.especialidad === especialidad && m.zona === zona
  );

  if (medicosFiltrados.length === 0) {
    return null;
  }

  for (const medico of medicosFiltrados) {
    // 3. Verificar Disponibilidad por Rango
    const rangoDisponible = disponibilidadBase.find((d) => {
      if (d.medicoId !== medico.id || d.diaSemana !== diaCita) {
        return false;
      }

      const [hIniM, minIniM] = d.horaInicio.split(":").map(Number);
      const horaInicioMedicoMinutos = hIniM * 60 + minIniM;
      const [hFinM, minFinM] = d.horaFin.split(":").map(Number);
      const horaFinMedicoMinutos = hFinM * 60 + minFinM;

      return (
        horaCitaMinutos >= horaInicioMedicoMinutos &&
        horaFinCitaMinutos <= horaFinMedicoMinutos
      );
    });

    if (!rangoDisponible) {
      continue;
    }

    // 4. Verificar Conflictos (usando la hora estandarizada)
    const estaOcupado = citas.some(
      (c) => c.medicoId === medico.id && c.fecha === fechaHoraEstandarizada
    );

    if (!estaOcupado) {
      return {
        ...medico,
        fechaEstandarizada: fechaHoraEstandarizada,
      };
    }
  }

  return null;
}

// === LISTENER PRINCIPAL DEL FORMULARIO ===

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const paciente = document.getElementById("paciente").value;
  const especialidad = document.getElementById("especialidad").value;
  const motivo = document.getElementById("motivo").value || "-";
  const zona = document.getElementById("zona").value;
  const fechaHora = document.getElementById("fecha").value;

  const medicoDisponible = verificarDisponibilidad(
    especialidad,
    zona,
    fechaHora
  );

  if (!medicoDisponible) {
    mensaje.textContent = `❌ Lo sentimos, no hay médicos disponibles o el bloque ya está ocupado.`;
    setTimeout(() => (mensaje.textContent = ""), 6000);
    return;
  }

  const fechaHoraBloque = medicoDisponible.fechaEstandarizada;

  const nueva = {
    id: Date.now(),
    paciente,
    especialidad,
    motivo,
    zona,
    fecha: fechaHoraBloque,
    medicoId: medicoDisponible.id,
    medicoNombre: medicoDisponible.nombre,
    estado: "Agendada",
  };

  citas.unshift(nueva);
  saveCitas(); // Guardar citas en localStorage

  // Extraer la hora HH:MM del string YYYY-MM-DDTHH:MM (FIX ZONA HORARIA)
  const [_, timePartMessage] = fechaHoraBloque.split("T");

  // Notificación y mensaje de éxito
  const notifMsg = `Cita agendada para ${paciente} con ${medicoDisponible.nombre} a las ${timePartMessage}.`;
  addNotificacion(notifMsg, "cita"); // Añadir al sistema de notificaciones

  mensaje.textContent = `✅ ${notifMsg}`;
  setTimeout(() => (mensaje.textContent = ""), 4000);

  form.reset();
  renderCitas();
});

// === RENDERIZADO DEL HISTORIAL ===

function renderCitas() {
  lista.innerHTML = "";
  if (citas.length === 0) {
    lista.innerHTML = "<li>No hay citas agendadas</li>";
    return;
  }

  citas.forEach((c) => {
    const li = document.createElement("li");

    // FIX ZONA HORARIA: Separar fecha y hora para evitar conversiones.
    const [datePart, timePart] = c.fecha.split("T");
    const formattedDate = datePart.split("-").reverse().join("/");

    li.innerHTML = `
      <strong>${c.paciente}</strong> — ${c.especialidad}<br>
      Médico: ${c.medicoNombre || "N/A"}<br>
      Motivo: ${c.motivo}<br>
      Zona: ${c.zona}<br>
      Fecha: ${formattedDate} ${timePart}<br>
      Estado: ${c.estado}
    `;
    lista.appendChild(li);
  });
}

// === INICIALIZACIÓN DE LA APLICACIÓN ===
// 1. Cargar las citas desde localStorage
loadCitas();
// 2. Cargar las notificaciones desde localStorage
loadNotificaciones();
// 3. Renderizar el historial
renderCitas();

/* ================== LOGIN & REGISTRO ================== */
let usuarios = [{ user: "admin", pass: "1234" }];
let usuarioActivo = null;

const modal = document.getElementById("auth-modal");
const btnLogin = document.getElementById("btn-login");
const closeModal = document.getElementById("close-modal");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const linkRegister = document.getElementById("link-register");
const toggleText = document.getElementById("toggle-form");
const modalTitle = document.getElementById("modal-title");

// Abrir modal
btnLogin.addEventListener("click", () => {
  modal.style.display = "block";
});

// Cerrar modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Cambiar a registro
linkRegister.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "block";
  loginForm.style.display = "none";
  modalTitle.textContent = "Registrar Usuario";
  toggleText.innerHTML = `¿Ya tienes cuenta? <a href="#" id="link-login">Inicia sesión aquí</a>`;

  document.getElementById("link-login").addEventListener("click", (ev) => {
    ev.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    modalTitle.textContent = "Iniciar Sesión";
    toggleText.innerHTML = `¿No tienes cuenta? <a href="#" id="link-register">Regístrate aquí</a>`;
  });
});

// Procesar login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;

  const encontrado = usuarios.find((u) => u.user === user && u.pass === pass);
  if (encontrado) {
    usuarioActivo = user;
    alert(`Bienvenido, ${user}`);
    btnLogin.textContent = user;
    modal.style.display = "none";
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});

// Procesar registro
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("reg-user").value;
  const pass = document.getElementById("reg-pass").value;

  if (usuarios.some((u) => u.user === user)) {
    alert("Ese usuario ya existe");
    return;
  }

  usuarios.push({ user, pass });
  alert("Usuario registrado con éxito. Ahora puedes iniciar sesión.");
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  modalTitle.textContent = "Iniciar Sesión";
});
