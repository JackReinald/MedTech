/* ================== CITAS ================== */
let citas = [];

const form = document.getElementById("form-cita");
const lista = document.getElementById("lista-citas");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", e => {
  e.preventDefault();

  if (!usuarioActivo) {
    alert("Debes iniciar sesión para agendar una cita");
    return;
  }

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
linkRegister.addEventListener("click", e => {
  e.preventDefault();
  registerForm.style.display = "block";
  loginForm.style.display = "none";
  modalTitle.textContent = "Registrar Usuario";
  toggleText.innerHTML = `¿Ya tienes cuenta? <a href="#" id="link-login">Inicia sesión aquí</a>`;
  
  document.getElementById("link-login").addEventListener("click", ev => {
    ev.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    modalTitle.textContent = "Iniciar Sesión";
    toggleText.innerHTML = `¿No tienes cuenta? <a href="#" id="link-register">Regístrate aquí</a>`;
  });
});

// Procesar login
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;

  const encontrado = usuarios.find(u => u.user === user && u.pass === pass);
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
registerForm.addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("reg-user").value;
  const pass = document.getElementById("reg-pass").value;

  if (usuarios.some(u => u.user === user)) {
    alert("Ese usuario ya existe");
    return;
  }

  usuarios.push({ user, pass });
  alert("Usuario registrado con éxito. Ahora puedes iniciar sesión.");
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  modalTitle.textContent = "Iniciar Sesión";
});

  