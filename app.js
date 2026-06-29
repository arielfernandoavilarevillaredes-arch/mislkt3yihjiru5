const DATA_URL = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/data.json";

let profesionales = [];

document.body.innerHTML = `
<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family: "Segoe UI", Arial, sans-serif;
    background: linear-gradient(135deg,#0f172a,#1e293b,#111827);
    min-height:100vh;
    color:white;
}

header{
    text-align:center;
    padding:30px 20px;
    background:rgba(255,255,255,.05);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(255,255,255,.08);
}

h2{
    margin-bottom:10px;
}

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

#contenedor{
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));
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

.card-cat .nombre{
    font-weight:bold;
    font-size:14px;
}

/* PROFESIONALES */
.card-prof{
    background:rgba(255,255,255,.08);
    border:1px solid rgba(255,255,255,.08);
    border-radius:14px;
    padding:12px;
    font-size:13px;
}

.card-prof h3{
    font-size:15px;
    margin-bottom:6px;
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
    <button id="volver">⬅ Volver</button>
</header>

<div id="contenedor">Cargando...</div>
`;

const contenedor = document.getElementById("contenedor");
const volver = document.getElementById("volver");

// ===== CARGAR DATOS =====
fetch(DATA_URL)
    .then(res => res.json())
    .then(data => {
        profesionales = data;
        renderCategorias();
    });

// ===== ICONOS PNG POR CATEGORÍA =====
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
function agruparPorCategoria(lista) {
    const grupos = {};

    lista.forEach(p => {
        const cat = p.categoria || "Otros";
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(p);
    });

    return grupos;
}

// ===== RENDER CATEGORÍAS =====
function renderCategorias() {
    volver.style.display = "none";

    const grupos = agruparPorCategoria(profesionales);

    contenedor.innerHTML = Object.keys(grupos).sort().map(cat => `
        <div class="card-cat" onclick="verCategoria('${cat}')">
            <img src="${icono(cat)}" alt="${cat}">
            <div class="nombre">${cat}</div>
        </div>
    `).join("");
}

// ===== VER PROFESIONALES =====
function verCategoria(cat) {
    volver.style.display = "inline-block";

    const filtrados = profesionales.filter(p => p.categoria === cat);

    contenedor.innerHTML = filtrados.map(p => `
        <div class="card-prof">
            <h3>${p.nombre}</h3>
            <p><b>${p.categoria}</b></p>
            <p>📍 ${p.ciudad || "Sin ciudad"}</p>
            <p>🏠 ${p.direccion || "Sin dirección"}</p>

            <a href="tel:${p.telefono}">Llamar</a>
            <a href="https://wa.me/${p.whatsapp}" target="_blank">WhatsApp</a>
        </div>
    `).join("");
}

// ===== VOLVER =====
volver.onclick = () => renderCategorias();
