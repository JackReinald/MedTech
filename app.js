let citas = [];

const form = document.getElementById("form-cita");
const lista = document.getElementById("lista-citas");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", e => {
  e.preventDefault();

  const paciente = document.getElementById("paciente").value;
  const especialidad = document.getElementById("especialidad").value;
  const motivo = document.getElementById("motivo").value || "-";
  const zona = document.getElementById("zona").value;
  const fecha = document.getElementById("fecha").value;

  const nueva = {
    id: Date.now(),
    paciente,
    especialidad,
    motivo,
    zona,
    fecha,
    estado: "Agendada"
  };

  citas.unshift(nueva);

  mensaje.textContent = `✅ Cita agendada para ${paciente}`;
  setTimeout(() => mensaje.textContent = "", 4000);

  form.reset();
  renderCitas();
});

function renderCitas() {
  lista.innerHTML = "";
  if (citas.length === 0) {
    lista.innerHTML = "<li>No hay citas agendadas</li>";
    return;
  }

  citas.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.paciente}</strong> — ${c.especialidad}<br>
      Motivo: ${c.motivo}<br>
      Zona: ${c.zona}<br>
      Fecha: ${new Date(c.fecha).toLocaleString()}<br>
      Estado: ${c.estado}
    `;
    lista.appendChild(li);
  });
}

renderCitas();
