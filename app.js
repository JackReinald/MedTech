let citas = [];

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

// 2. Array de Disponibilidad (RANGOS de tiempo)
const disponibilidadBase = [
  // Dra. Ana Torres (101): Lunes (1) de 09:00 a 11:00
  { medicoId: 101, diaSemana: 1, horaInicio: "09:00", horaFin: "11:00" },
  // Dra. Ana Torres (101): Miércoles (3) de 14:00 a 16:00
  { medicoId: 101, diaSemana: 3, horaInicio: "14:00", horaFin: "16:00" },

  // Dr. Luis Gómez (102): Viernes (5) de 16:00 a 18:00
  { medicoId: 102, diaSemana: 5, horaInicio: "16:00", horaFin: "18:00" },

  // Dra. Carla Díaz (201): Martes (2) de 11:00 a 13:00
  { medicoId: 201, diaSemana: 2, horaInicio: "11:00", horaFin: "13:00" },
];

// Duración estándar de la cita en minutos
const DURACION_CITA_MINUTOS = 30;

// ===================================================

const form = document.getElementById("form-cita");
const lista = document.getElementById("lista-citas");
const mensaje = document.getElementById("mensaje");

function ajustarHoraAlBloque(fecha) {
  const minutos = fecha.getMinutes();
  // Encuentra el múltiplo de DURACION_CITA_MINUTOS más cercano hacia abajo
  const minutosAjustados =
    Math.floor(minutos / DURACION_CITA_MINUTOS) * DURACION_CITA_MINUTOS;

  // Crea una nueva fecha/hora con los minutos redondeados y segundos/milisegundos a cero
  fecha.setMinutes(minutosAjustados, 0, 0);
  return fecha;
}

// === LÓGICA DE VERIFICACIÓN DE DISPONIBILIDAD CORREGIDA ===

function verificarDisponibilidad(especialidad, zona, fechaHora) {
  let fechaCita = new Date(fechaHora);
  const diaCita = fechaCita.getDay(); // 0 (Domingo) a 6 (Sábado)

  // PASO CLAVE 1: Estandarizar la hora al bloque.
  fechaCita = ajustarHoraAlBloque(fechaCita);

  // --- CORRECCIÓN CLAVE DE ZONA HORARIA (Colombia UTC-5) ---
  // Construimos el string manualmente con los métodos get*() (que devuelven la hora local).
  const year = fechaCita.getFullYear();
  const month = String(fechaCita.getMonth() + 1).padStart(2, "0");
  const day = String(fechaCita.getDate()).padStart(2, "0");
  const hours = String(fechaCita.getHours()).padStart(2, "0");
  const minutes = String(fechaCita.getMinutes()).padStart(2, "0");

  // Generar el string estandarizado (YYYY-MM-DDTHH:MM)
  const fechaHoraEstandarizada = `${year}-${month}-${day}T${hours}:${minutes}`;
  // --- FIN CORRECCIÓN CLAVE ---

  const horaCitaMinutos = fechaCita.getHours() * 60 + fechaCita.getMinutes();
  const horaFinCitaMinutos = horaCitaMinutos + DURACION_CITA_MINUTOS;

  // 1. Filtrar Médicos por especialidad y zona
  const medicosFiltrados = medicos.filter(
    (m) => m.especialidad === especialidad && m.zona === zona
  );

  if (medicosFiltrados.length === 0) {
    return null;
  }

  // 2. Iterar sobre los médicos disponibles
  for (const medico of medicosFiltrados) {
    // 3. Verificar Disponibilidad por Rango (usa la hora estandarizada)
    const rangoDisponible = disponibilidadBase.find((d) => {
      if (d.medicoId !== medico.id || d.diaSemana !== diaCita) {
        return false;
      }

      // Convertir rangos del médico a minutos
      const [hIniM, minIniM] = d.horaInicio.split(":").map(Number);
      const horaInicioMedicoMinutos = hIniM * 60 + minIniM;
      const [hFinM, minFinM] = d.horaFin.split(":").map(Number);
      const horaFinMedicoMinutos = hFinM * 60 + minFinM;

      // La cita (estandarizada) debe caer dentro del rango del médico.
      return (
        horaCitaMinutos >= horaInicioMedicoMinutos &&
        horaFinCitaMinutos <= horaFinMedicoMinutos
      );
    });

    if (!rangoDisponible) {
      continue;
    }

    // 4. Verificar Conflictos (Citas ya agendadas)
    // PASO CLAVE 2: Usar la HORA ESTANDARIZADA para buscar el conflicto.
    const estaOcupado = citas.some(
      (c) => c.medicoId === medico.id && c.fecha === fechaHoraEstandarizada
    );

    if (!estaOcupado) {
      // ¡Médico encontrado! Devolvemos la información del médico Y la hora estandarizada.
      return {
        ...medico,
        fechaEstandarizada: fechaHoraEstandarizada,
      };
    }
  }

  return null;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const paciente = document.getElementById("paciente").value;
  const especialidad = document.getElementById("especialidad").value;
  const motivo = document.getElementById("motivo").value || "-";
  const zona = document.getElementById("zona").value;
  const fecha = document.getElementById("fecha").value;
  const fechaHora = document.getElementById("fecha").value;

  // Llama a la función de verificación.
  const medicoDisponible = verificarDisponibilidad(
    especialidad,
    zona,
    fechaHora
  );

  if (!medicoDisponible) {
    // Bloquear el agendamiento y mostrar mensaje de error
    mensaje.textContent = `❌ Lo sentimos, no hay médicos disponibles de ${especialidad} en ${zona} a la hora solicitada, o el bloque ya está ocupado.`;
    setTimeout(() => (mensaje.textContent = ""), 6000);
    return;
  }

  // PASO CLAVE 3: Obtener la hora estandarizada para guardar.
  const fechaHoraBloque = medicoDisponible.fechaEstandarizada;

  const nueva = {
    id: Date.now(),
    paciente,
    especialidad,
    motivo,
    zona,
    // Se guarda la hora estandarizada (ej: 2025-10-20T09:30) para evitar conflictos futuros.
    fecha: fechaHoraBloque,
    medicoId: medicoDisponible.id,
    medicoNombre: medicoDisponible.nombre,
    estado: "Agendada",
  };

  citas.unshift(nueva);

  // Usamos el objeto Date para mostrar la hora de forma amigable en el mensaje
  const horaMostrada = new Date(fechaHoraBloque).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  mensaje.textContent = `✅ Cita agendada para ${paciente}`;
  setTimeout(() => (mensaje.textContent = ""), 4000);

  form.reset();
  renderCitas();
});

function renderCitas() {
  lista.innerHTML = "";
  if (citas.length === 0) {
    lista.innerHTML = "<li>No hay citas agendadas</li>";
    return;
  }

  citas.forEach((c) => {
    const li = document.createElement("li");

    // --- CORRECCIÓN DE ZONA HORARIA ---
    // c.fecha tiene el formato YYYY-MM-DDTHH:MM
    // Extraemos la fecha y hora directamente, eliminando la 'T'
    const [datePart, timePart] = c.fecha.split("T");

    // Formateamos la fecha (opcional: YYYY-MM-DD a DD/MM/YYYY)
    const formattedDate = datePart.split("-").reverse().join("/");

    li.innerHTML = `
      <strong>${c.paciente}</strong> — ${c.especialidad}<br>
      Médico: ${c.medicoNombre || "N/A"}<br>
      Motivo: ${c.motivo}<br>
      Zona: ${c.zona}<br>
      Fecha: ${formattedDate} ${timePart}<br>
      Estado: ${c.estado}
    `;
    // ----------------------------------
    lista.appendChild(li);
  });
}
renderCitas();
