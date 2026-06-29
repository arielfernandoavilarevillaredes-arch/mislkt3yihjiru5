const DATA_URL = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/data.json";

let profesionales = [];
let vista = "categorias";
let categoriaActual = null;

document.body.innerHTML = `
<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:"Segoe UI", Arial, sans-serif;
    background: linear-gradient(135deg,#0f172a,#1e293b,#111827);
    min-height:100vh;
    color:white;
}

/* HEADER */
header{
    text-align:center;
    padding:25px 15px;
    background:rgba(255,255,255,.05);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(255,255,255,.08);
}

h2{
    margin-bottom:10px;
}

/* BUSCADOR */
input{
    width:min(650px,90%);
    padding:11px 14px;
    border:none;
    border-radius:10px;
    background:rgba(255,255,255,.12);
    color:white;
    outline:none;
}

input::placeholder{
    color:#cbd5e1;
}

/* BOTÓN VOLVER */
#volver{
    display:none;
    margin-top:10px;
    padding:8px 14px;
    border:none;
    border-radius:10px;
    cursor:pointer;
    background:#3b82f6;
    color:white;
    font-weight:bold;
}

/* GRID */
#contenedor{
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
    gap:12px;
    padding:20px;
}

/* CATEGORÍAS */
.card-cat{
    background:rgba(255,255,255,.08);
    border-radius:14px;
    padding:15px;
    cursor:pointer;
    transition:.25s ease;
    text-align:center;
    border:1px solid rgba(255,255,255,.08);
}

.card-cat:hover{
    transform:translateY(-6px) scale(1.03);
    background:rgba(255,255,255,.12);
    box-shadow:0 18px 35px rgba(0,0,0,.35);
}

.card-cat img{
    width:55px;
    height:55px;
    object-fit:contain;
    margin-bottom:8px;
}

/* PROFESIONALES */
.card-prof{
    background:rgba(255,255,255,.08);
    border-radius:14px;
    padding:12px;
    border:1px solid rgba(255,255,255,.08);
    transition:.25s ease;
}

.card-prof:hover{
    transform:translateY(-6px) scale(1.03);
    background:rgba(255,255,255,.12);
    box-shadow:0 18px 35px rgba(0,0,0,.35);
}

.prof-top{
    display:flex;
    gap:10px;
    align-items:center;
    margin-bottom:8px;
}

.prof-top img{
    width:35px;
    height:35px;
}

.badge{
    display:inline-block;
    padding:3px 8px;
    font-size:11px;
    border-radius:999px;
    background:rgba(59,130,246,.25);
    color:#93c5fd;
    margin-top:3px;
}

.card-prof p{
    color:#cbd5e1;
    margin-bottom:4px;
}

.card-prof a{
    display:inline-block;
    margin-top:8px;
    padding:6px 10px;
    background:linear-gradient(135deg,#3b82f6,#06b6d4);
    color:white;
    text-decoration:none;
    border-radius:8px;
    font-size:12px;
    margin-right:5px;
}
</style>

<header>
    <h2>Servicios Río Colorado</h2>
    <input id="buscador" placeholder="Buscar profesional, rubro, ciudad, tags...">
    <button id="volver">⬅ Volver</button>
</header>

<div id="contenedor">Cargando...</div>
`;

const contenedor = document.getElementById("contenedor");
const buscador = document.getElementById("buscador");
const volver = document.getElementById("volver");

// ===== NORMALIZAR (FIX CRÍTICO) =====
function norm(t) {
    return (t || "").toLowerCase().trim();
}

// ===== CARGA =====
fetch(DATA_URL)
    .then(r => r.json())
    .then(data => {
        profesionales = data;
        renderCategorias();
    });

// ===== ICONOS =====
function icono(cat) {
    const c = norm(cat);

    if (c.includes("plom")) return "icons/plomero.png";
    if (c.includes("comput") || c.includes("celular")) return "icons/computadora.png";
    if (c.includes("emergencia")) return "icons/emergencias.png";
    if (c.includes("electric")) return "icons/electricista.png";
    if (c.includes("gas")) return "icons/gasista.png";
    if (c.includes("carpint")) return "icons/carpintero.png";
    if (c.includes("pint")) return "icons/pintor.png";

    return "icons/default.png";
}

// ===== HORARIO PRO =====
function estadoHorario(horario) {
    const ahora = new Date();
    const dia = ahora.getDay();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const hoy = dias[dia];

    function parse(h) {
        const m = h.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
        if (!m) return null;

        let ini = parseInt(m[1]) * 60;
        let fin = parseInt(m[3]) * 60;

        if (m[2]) ini += parseInt(m[2]);
        if (m[4]) fin += parseInt(m[4]);

        return { ini, fin };
    }

    const texto = horario?.[hoy];

    if (!texto || texto.toLowerCase() === "cerrado") {
        return buscarProximo(horario, dia);
    }

    if (texto.includes("24")) {
        return { estado: "abierto" };
    }

    const h = parse(texto);
    if (!h) return { estado: "abierto" };

    if (horaActual >= h.ini && horaActual < h.fin) {
        return {
            estado: "abierto",
            cierraEn: h.fin - horaActual
        };
    }

    if (horaActual < h.ini) {
        return {
            estado: "cerrado",
            abreEn: h.ini - horaActual
        };
    }

    return buscarProximo(horario, dia);
}

// ===== PRÓXIMO DÍA =====
function buscarProximo(horario, diaActual) {
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

    for (let i = 1; i <= 7; i++) {
        const d = (diaActual + i) % 7;
        const texto = horario?.[dias[d]];

        if (texto && texto.toLowerCase() !== "cerrado") {
            return {
                estado: "cerrado",
                abreEn: i * 24 * 60,
                texto: `Abre el ${dias[d]}`
            };
        }
    }

    return {
        estado: "cerrado",
        texto: "Cerrado toda la semana"
    };
}

// ===== FORMATO =====
function formatearMinutos(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ===== AGRUPAR =====
function agrupar(lista) {
    const g = {};
    lista.forEach(p => {
        const c = p.categoria || "Otros";
        if (!g[c]) g[c] = [];
        g[c].push(p);
    });
    return g;
}

// ===== ORDEN POR APERTURA =====
function tiempoApertura(p) {
    const e = estadoHorario(p.horario);
    if (e.cierraEn != null) return 0;
    if (e.abreEn != null) return e.abreEn;
    return 999999;
}

// ===== CATEGORÍAS =====
function renderCategorias() {
    vista = "categorias";
    categoriaActual = null;

    volver.style.display = "none";

    const grupos = agrupar(profesionales);

    contenedor.innerHTML = Object.keys(grupos).sort().map(cat => `
        <div class="card-cat" data-cat="${cat}">
            <img src="${icono(cat)}">
            <div>${cat}</div>
        </div>
    `).join("");
}

// ===== CLICK =====
contenedor.addEventListener("click", (e) => {
    const card = e.target.closest(".card-cat");
    if (!card) return;
    categoriaActual = norm(card.dataset.cat);
    verCategoria();
});

// ===== VER CATEGORÍA =====
function verCategoria() {
    vista = "lista";
    volver.style.display = "inline-block";
    renderLista(filtrar(profesionales));
}

// ===== FILTRO =====
function filtrar(lista) {
    const t = norm(buscador.value);

    return lista.filter(p => {
        const texto = `
            ${p.nombre}
            ${p.categoria}
            ${(p.tags || []).join(" ")}
            ${p.ciudad}
            ${p.direccion}
        `.toLowerCase();

        if (vista === "lista") {
            return norm(p.categoria) === categoriaActual && texto.includes(t);
        }

        return texto.includes(t);
    });
}

// ===== RENDER LISTA =====
function renderLista(lista) {

    lista = [...lista].sort((a,b) => tiempoApertura(a) - tiempoApertura(b));

    contenedor.innerHTML = lista.map(p => {

        const e = estadoHorario(p.horario);

        return `
        <div class="card-prof">

            <div class="prof-top">
                <img src="${icono(p.categoria)}">
                <div>
                    <b>${p.nombre}</b>
                    <div class="badge">${p.categoria}</div>
                </div>
            </div>

            <p>📍 ${p.ciudad || "Sin ciudad"}</p>
            <p>🏠 ${p.direccion || "Sin dirección"}</p>

            <p style="font-weight:bold;">
                ${e.estado === "abierto" ? "🟢 Abierto ahora" : "🔴 Cerrado ahora"}
            </p>

            ${e.cierraEn ? `<p style="color:#facc15">⏳ Cierra en ${formatearMinutos(e.cierraEn)}</p>` : ""}
            ${e.abreEn ? `<p style="color:#38bdf8">⏱ Abre en ${formatearMinutos(e.abreEn)}</p>` : ""}
            ${e.texto ? `<p style="color:#94a3b8">📅 ${e.texto}</p>` : ""}

            <a href="tel:${p.telefono}">Llamar</a>
            <a href="https://wa.me/${p.whatsapp}" target="_blank">WhatsApp</a>
        </div>
        `;
    }).join("");
}

// ===== BUSCADOR =====
buscador.addEventListener("input", () => {
    if (vista === "categorias") {
        const grupos = agrupar(profesionales);

        const filtradas = Object.keys(grupos).filter(cat =>
            norm(cat).includes(norm(buscador.value))
        );

        contenedor.innerHTML = filtradas.map(cat => `
            <div class="card-cat" data-cat="${cat}">
                <img src="${icono(cat)}">
                <div>${cat}</div>
            </div>
        `).join("");
    } else {
        renderLista(filtrar(profesionales));
    }
});

// ===== VOLVER =====
volver.onclick = () => {
    buscador.value = "";
    renderCategorias();
};
