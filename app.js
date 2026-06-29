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
    padding:35px 20px;
    background:rgba(255,255,255,.05);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(255,255,255,.08);
}

header h2{
    font-size:2rem;
    margin-bottom:12px;
}

input{
    width:min(600px,90%);
    padding:12px 16px;
    border:none;
    border-radius:12px;
    background:rgba(255,255,255,.12);
    color:white;
    font-size:15px;
    outline:none;
    transition:.3s;
}

input::placeholder{
    color:#cbd5e1;
}

input:focus{
    background:rgba(255,255,255,.18);
    box-shadow:0 0 0 3px rgba(59,130,246,.3);
}

#contenedor{
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(190px, 1fr));
    gap:14px;
    padding:20px;
}

.card{
    background:rgba(255,255,255,.08);
    backdrop-filter:blur(15px);
    border:1px solid rgba(255,255,255,.08);
    border-radius:14px;
    padding:12px;
    transition:.3s;
    font-size:13px;
}

.card:hover{
    transform:translateY(-5px);
    box-shadow:0 15px 30px rgba(0,0,0,.35);
}

.card h3{
    font-size:15px;
    margin-bottom:6px;
}

.card b{
    display:block;
    margin-bottom:6px;
    color:#93c5fd;
}

.card p{
    color:#cbd5e1;
    line-height:1.4;
    margin-bottom:4px;
}

.card a{
    display:inline-block;
    margin-top:10px;
    padding:8px 10px;
    background:linear-gradient(135deg,#3b82f6,#06b6d4);
    color:white;
    text-decoration:none;
    border-radius:10px;
    font-weight:600;
    font-size:12px;
    margin-right:5px;
}
</style>

<header>
    <h2>Servicios Río Colorado</h2>
    <input id="buscar" placeholder="Buscar profesional o rubro...">
</header>

<div id="contenedor">Cargando...</div>
`;

const contenedor = document.getElementById("contenedor");
const buscar = document.getElementById("buscar");

// ===== CARGAR DATOS =====
fetch(DATA_URL)
    .then(res => res.json())
    .then(data => {
        profesionales = ordenarPorCategoria(data);
        render(profesionales);
    })
    .catch(err => {
        contenedor.innerHTML = "Error cargando datos";
        console.log(err);
    });

// ===== ORDEN POR CATEGORÍA =====
function ordenarPorCategoria(lista) {
    return lista.sort((a, b) =>
        (a.categoria || "").localeCompare(b.categoria || "")
    );
}

// ===== RENDER =====
function render(lista) {
    contenedor.innerHTML = lista.map(p => `
        <div class="card">
            <h3>${p.nombre}</h3>
            <b>${p.categoria}</b>

            <p>${(p.tags || []).join(", ")}</p>

            <p>📍 ${p.ciudad || "Sin ciudad"}</p>
            <p>🏠 ${p.direccion || "Sin dirección"}</p>

            <a href="tel:${p.telefono}">Llamar</a>
            <a href="https://wa.me/${p.whatsapp}" target="_blank">WhatsApp</a>
        </div>
    `).join("");
}

// ===== BUSCADOR =====
buscar.addEventListener("input", () => {
    const t = buscar.value.toLowerCase();

    const filtrados = profesionales.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        p.categoria.toLowerCase().includes(t) ||
        (p.tags || []).join(" ").toLowerCase().includes(t)
    );

    render(filtrados);
});
