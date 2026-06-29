import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== CONFIG FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyBMIU2q4pQ643sm6nY0dBSLFejBTtaWf9M",
  authDomain: "w-a66c5.firebaseapp.com",
  projectId: "w-a66c5",
  storageBucket: "w-a66c5.firebasestorage.app",
  messagingSenderId: "732376393214",
  appId: "1:732376393214:web:c70b178794272a07e44caf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== DOM =====
const contenedor = document.getElementById("app");

let profesionales = [];

// ===== CARGAR DESDE FIREBASE =====
async function cargarProfesionales() {
  const snap = await getDocs(collection(db, "profesionales"));

  profesionales = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  render(profesionales);
}

cargarProfesionales();

function icono(cat = "") {
  cat = cat.toLowerCase();

  if (cat.includes("electric")) return "⚡";
  if (cat.includes("plom")) return "🚰";
  if (cat.includes("gas")) return "🔥";
  if (cat.includes("mec")) return "🚗";
  if (cat.includes("pint")) return "🎨";
  if (cat.includes("jard")) return "🌳";
  if (cat.includes("abog")) return "⚖️";
  if (cat.includes("med")) return "🩺";

  return "👤";
}

function render(lista) {
  if (!lista.length) {
    contenedor.innerHTML = "<p>No hay resultados</p>";
    return;
  }

  contenedor.innerHTML = lista.map(p => `
    <div class="card">
      <div class="heart">❤️ ${p.favoritos || 0}</div>

      <h2>${icono(p.categoria)} ${p.nombre}</h2>

      <b>${p.categoria}</b>

      <p>📍 ${p.direccion || ""}</p>
      <p>🏙 ${p.ciudad || ""}</p>

      <p>${p.descripcion || ""}</p>

      <p class="tags">${(p.tags || []).join(" • ")}</p>

      <div class="botones">
        <a href="tel:${p.telefono}">📞 Llamar</a>
        <a href="https://wa.me/${p.whatsapp}" target="_blank">💬 WhatsApp</a>
        <button onclick="sumarFavorito('${p.id}', ${p.favoritos || 0})">❤️</button>
      </div>
    </div>
  `).join("");
}


const yaVotados = JSON.parse(localStorage.getItem("favs")) || {};

window.sumarFavorito = async function(id, actual) {

  if (yaVotados[id]) {
    alert("Ya votaste este profesional desde este navegador");
    return;
  }

  const ref = doc(db, "profesionales", id);

  await updateDoc(ref, {
    favoritos: increment(1)
  });

  yaVotados[id] = true;
  localStorage.setItem("favs", JSON.stringify(yaVotados));

  cargarProfesionales();
};


const buscador = document.createElement("input");
buscador.placeholder = "Buscar...";
buscador.style.width = "100%";
buscador.style.padding = "12px";
buscador.style.margin = "10px 0";

document.body.insertBefore(buscador, contenedor);

buscador.addEventListener("input", () => {
  const t = buscador.value.toLowerCase();

  const filtrados = profesionales.filter(p =>
    (p.nombre || "").toLowerCase().includes(t) ||
    (p.categoria || "").toLowerCase().includes(t) ||
    (p.ciudad || "").toLowerCase().includes(t) ||
    (p.direccion || "").toLowerCase().includes(t) ||
    (p.tags || []).join(" ").toLowerCase().includes(t)
  );

  render(filtrados);
});


