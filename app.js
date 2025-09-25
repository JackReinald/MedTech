// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9u3ER8UE3QxR6JbiJPfxr1zS17N-4A8M",
  authDomain: "medtech-72bf9.firebaseapp.com",
  projectId: "medtech-72bf9",
  storageBucket: "medtech-72bf9.firebasestorage.app",
  messagingSenderId: "1016047080605",
  appId: "1:1016047080605:web:2154dc9409794793e3f074",
  measurementId: "G-9FQT62L1KD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
