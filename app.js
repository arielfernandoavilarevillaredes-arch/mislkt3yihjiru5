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
    padding:40px 20px;
    background:rgba(255,255,255,.05);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(255,255,255,.08);
}

header h1{
    font-size:2.2rem;
    margin-bottom:15px;
}

input{
    width:min(600px,90%);
    padding:14px 18px;
    border:none;
    border-radius:14px;
    background:rgba(255,255,255,.12);
    color:white;
    font-size:16px;
    outline:none;
    transition:.3s;
    backdrop-filter:blur(10px);
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
    grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
    gap:25px;
    padding:35px;
}

.card{
    background:rgba(255,255,255,.08);
    backdrop-filter:blur(15px);
    border:1px solid rgba(255,255,255,.08);
    border-radius:18px;
    padding:20px;
    transition:.3s;
    overflow:hidden;
    position:relative;
}

.card::before{
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(135deg,transparent,rgba(255,255,255,.05));
    pointer-events:none;
}

.card:hover{
    transform:translateY(-8px);
    box-shadow:0 20px 35px rgba(0,0,0,.35);
}

.card h3{
    margin-bottom:10px;
    font-size:20px;
}

.card p{
    color:#cbd5e1;
    line-height:1.6;
}

.card a{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    margin-top:18px;
    padding:12px 18px;
    background:linear-gradient(135deg,#3b82f6,#06b6d4);
    color:white;
    text-decoration:none;
    border-radius:12px;
    font-weight:600;
    transition:.3s;
}

.card a:hover{
    transform:scale(1.05);
    box-shadow:0 10px 25px rgba(59,130,246,.45);
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
        profesionales = data;
        render(profesionales);
    })
    .catch(err => {
        contenedor.innerHTML = "Error cargando datos";
        console.log(err);
    });

// ===== RENDER =====
function render(lista) {
    contenedor.innerHTML = lista.map(p => `
        <div class="card">
            <h3>${p.nombre}</h3>
            <b>${p.categoria}</b>
            <p>${(p.tags || []).join(", ")}</p>

            <a href="tel:${p.telefono}">Llamar</a><br>
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
