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

/* INPUTS */
input{
    width:min(600px,90%);
    padding:10px 14px;
    border:none;
    border-radius:10px;
    background:rgba(255,255,255,.12);
    color:white;
    outline:none;
    margin:5px;
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
    grid-template-columns:repeat(auto-fill, minmax(170px, 1fr));
    gap:12px;
    padding:20px;
}

/* CATEGORÍAS */
.card-cat{
    background:rgba(255,255,255,.08);
    border:1px solid rgba(255,255,255,.08);
    border-radius:14px;
    padding:15px;
    cursor:pointer;
    transition:.3s;
    text-align:center;
}

.card-cat:hover{
    transform:translateY(-6px);
    background:rgba(255,255,255,.12);
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
    border:1px solid rgba(255,255,255,.08);
    border-radius:14px;
    padding:12px;
    font-size:13px;
}

.prof-top{
    display:flex;
    align-items:center;
    gap:10px;
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

    <input id="busquedaGlobal" placeholder="Buscar categoría o profesional...">
    <input id="busquedaLocal" placeholder="Buscar dentro de categoría..." style="display:none;">

    <button id="volver">⬅ Volver</button>
</header>

<div id="contenedor">Cargando...</div>
`;

const contenedor = document.getElementById("contenedor");
const volver = document.getElementById("volver");
const busquedaGlobal = document.getElementById("busquedaGlobal");
const busquedaLocal = document.getElementById("busquedaLocal");

// ===== CARGA =====
fetch(DATA_URL)
    .then(res => res.json())
    .then(data => {
        profesionales = data;
        renderCategorias();
    });

// ===== ICONOS =====
function icono(cat) {
    const c = cat.toLowerCase();

    if (c.includes("plom")) return "icons/plomero.png";
    if (c.includes("electric")) return "icons/electricista.png";
    if (c.includes("gas")) return "icons/gasista.png";
    if (c.includes("carpint")) return "icons/carpintero.png";
    if (c.includes("pint")) return "icons/pintor.png";

    return "icons/default.png";
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

// ===== CATEGORÍAS =====
function renderCategorias() {
    vista = "categorias";
    categoriaActual = null;

    volver.style.display = "none";
    busquedaLocal.style.display = "none";

    const grupos = agrupar(profesionales);

    contenedor.innerHTML = Object.keys(grupos).sort().map(cat => `
        <div class="card-cat" onclick="verCategoria('${cat}')">
            <img src="${icono(cat)}">
            <div>${cat}</div>
        </div>
    `).join("");
}

// ===== LISTA PROFESIONALES =====
function verCategoria(cat) {
    vista = "lista";
    categoriaActual = cat;

    volver.style.display = "inline-block";
    busquedaLocal.style.display = "inline-block";

    renderLista(profesionales.filter(p => p.categoria === cat));
}

// ===== RENDER LISTA =====
function renderLista(lista) {
    contenedor.innerHTML = lista.map(p => `
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

            <a href="tel:${p.telefono}">Llamar</a>
            <a href="https://wa.me/${p.whatsapp}" target="_blank">WhatsApp</a>
        </div>
    `).join("");
}

// ===== BUSCADOR GLOBAL =====
busquedaGlobal.addEventListener("input", e => {
    const t = e.target.value.toLowerCase();

    if (vista === "categorias") {
        const grupos = agrupar(profesionales);

        const filtradas = Object.keys(grupos).filter(cat =>
            cat.toLowerCase().includes(t)
        );

        contenedor.innerHTML = filtradas.map(cat => `
            <div class="card-cat" onclick="verCategoria('${cat}')">
                <img src="${icono(cat)}">
                <div>${cat}</div>
            </div>
        `).join("");
    } else {
        const filtrados = profesionales.filter(p =>
            p.categoria === categoriaActual &&
            (
                p.nombre.toLowerCase().includes(t) ||
                (p.tags || []).join(" ").toLowerCase().includes(t)
            )
        );

        renderLista(filtrados);
    }
});

// ===== BUSCADOR LOCAL =====
busquedaLocal.addEventListener("input", e => {
    const t = e.target.value.toLowerCase();

    const filtrados = profesionales.filter(p =>
        p.categoria === categoriaActual &&
        (
            p.nombre.toLowerCase().includes(t) ||
            (p.tags || []).join(" ").toLowerCase().includes(t)
        )
    );

    renderLista(filtrados);
});

// ===== VOLVER =====
volver.onclick = () => {
    busquedaGlobal.value = "";
    busquedaLocal.value = "";
    renderCategorias();
};
