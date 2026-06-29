const DATA_URL = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/data.json";

let profesionales = [];
let vista = "categorias";
let categoriaActual = null;

/* ================= UI ================= */
document.body.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box;}

body{
    font-family:"Segoe UI", Arial;
    background:linear-gradient(135deg,#0f172a,#1e293b,#111827);
    color:white;
    min-height:100vh;
}

header{
    text-align:center;
    padding:20px;
    background:rgba(255,255,255,.05);
    backdrop-filter:blur(10px);
}

h2{margin-bottom:10px;}

input{
    width:min(650px,90%);
    padding:10px;
    border:none;
    border-radius:10px;
    background:rgba(255,255,255,.12);
    color:white;
}

#volver{
    display:none;
    margin-top:10px;
    padding:8px 14px;
    border:none;
    border-radius:10px;
    background:#3b82f6;
    color:white;
    cursor:pointer;
}

#contenedor{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
    gap:12px;
    padding:20px;
}

/* cards */
.card-cat,.card-prof{
    background:rgba(255,255,255,.08);
    border-radius:14px;
    padding:12px;
    transition:.2s;
}

.card-cat:hover,.card-prof:hover{
    transform:scale(1.03);
    background:rgba(255,255,255,.12);
}

/* badge */
.badge{
    display:inline-block;
    padding:3px 8px;
    font-size:11px;
    border-radius:999px;
    background:rgba(59,130,246,.25);
    margin-top:4px;
}

/* botones */
.btn{
    display:inline-block;
    margin-top:8px;
    padding:8px 10px;
    border-radius:8px;
    font-size:12px;
    border:none;
    cursor:pointer;
    font-weight:bold;
}

.btn-call{background:#22c55e;color:white;}
.btn-wa{background:#25D366;color:white;}
</style>

<header>
<h2>Servicios Río Colorado</h2>
<input id="buscador" placeholder="Buscar...">
<button id="volver">⬅ Volver</button>
</header>

<div id="contenedor">Cargando...</div>
`;

const contenedor = document.getElementById("contenedor");
const buscador = document.getElementById("buscador");
const volver = document.getElementById("volver");

/* ================= HELP ================= */
function norm(t){ return (t||"").toLowerCase().trim(); }

function parseTime(t){
    if(!t) return 0;
    const [h,m] = t.split(":").map(Number);
    return h*60 + (m||0);
}

function formatTime(min){
    if(min <= 0) return "ahora";

    if(min < 60) return `${min} min`;

    const h = Math.floor(min/60);
    const m = min%60;

    if(h < 24){
        return m === 0 ? `${h} h` : `${h} h ${m} min`;
    }

    const d = Math.floor(h/24);
    const rh = h%24;

    return rh === 0 ? `${d} día${d>1?"s":""}` : `${d} día${d>1?"s":""} ${rh} h`;
}

/* ================= DATA ================= */
fetch(DATA_URL)
.then(r=>r.json())
.then(data=>{
    profesionales = data;
    renderCategorias();
});

/* ================= ICONOS ================= */
function icono(cat){
    const base = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/icons/";
    const c = norm(cat);

    if(c.includes("plom")) return base+"plomero.png";
    if(c.includes("comput") || c.includes("celular")) return base+"computadora.png";
    if(c.includes("emerg")) return base+"emergencias.png";
    if(c.includes("electric")) return base+"electricista.png";
    if(c.includes("gas")) return base+"gasista.png";
    if(c.includes("veter")) return base+"veterinaria.png";

    return base+"default.png";
}

/* ================= HORARIOS ================= */
function estadoHorario(h){

    if(!h || h === "sin horario"){
        return {
            estado:"abierto",
            texto:"🟢 Abierto todo el día (sin horario)"
        };
    }

    const ahora = new Date();
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const hoy = dias[ahora.getDay()];
    const minutos = ahora.getHours()*60 + ahora.getMinutes();

    if(h === "24h" || h === "24 horas"){
        return {
            estado:"abierto",
            texto:"🟢 Abierto todo el día"
        };
    }

    const dia = h[hoy];

    if(!dia || dia === "cerrado"){
        return {estado:"cerrado", texto:"🔴 Cerrado"};
    }

    const ini = parseTime(dia.abre);
    const fin = parseTime(dia.cierra);

    if(minutos >= ini && minutos < fin){
        return {
            estado:"abierto",
            texto:`🟢 Abierto · cierra en ${formatTime(fin-minutos)}`
        };
    }

    if(minutos < ini){
        return {
            estado:"cerrado",
            texto:`🔴 Cerrado · abre en ${formatTime(ini-minutos)}`
        };
    }

    return {estado:"cerrado", texto:"🔴 Cerrado"};
}

/* ================= AGRUPAR ================= */
function agrupar(list){
    const g={};
    list.forEach(p=>{
        const c=p.categoria||"Otros";
        if(!g[c]) g[c]=[];
        g[c].push(p);
    });
    return g;
}

/* ================= CATEGORÍAS ================= */
function renderCategorias(){
    vista="categorias";
    categoriaActual=null;
    volver.style.display="none";

    const grupos = agrupar(profesionales);

    contenedor.innerHTML = Object.keys(grupos).map(cat=>`
        <div class="card-cat" data-cat="${cat}">
            <img src="${icono(cat)}" width="40">
            <div>${cat}</div>
        </div>
    `).join("");
}

/* FIX CLICK */
contenedor.onclick = (e)=>{
    const c = e.target.closest(".card-cat");
    if(!c) return;
    categoriaActual = norm(c.dataset.cat);
    verCategoria();
};

function verCategoria(){
    vista="lista";
    volver.style.display="block";
    renderLista();
}

/* ================= FILTRO ================= */
function filtrar(list){
    const t = norm(buscador.value);

    return list.filter(p=>{
        const txt = `
        ${p.nombre}
        ${p.categoria}
        ${(p.tags||[]).join(" ")}
        ${p.ciudad}
        ${p.direccion}
        `.toLowerCase();

        return norm(p.categoria)===categoriaActual && txt.includes(t);
    });
}

/* ================= LISTA ================= */
function renderLista(){

    const list = filtrar(profesionales);

    contenedor.innerHTML = list.map(p=>{
        const e = estadoHorario(p.horario);

        return `
        <div class="card-prof">

            <b>${p.nombre}</b>
            <div class="badge">${p.categoria}</div>

            <p>📍 ${p.ciudad||""}</p>
            <p>🏠 ${p.direccion||""}</p>

            <p style="font-weight:bold;margin-top:6px;">
                ${e.texto}
            </p>

            <button class="btn btn-call"
                onclick="location.href='tel:${p.telefono}'">
                📞 Llamar
            </button>

            <button class="btn btn-wa"
                onclick="window.open('https://wa.me/${p.whatsapp}','_blank')">
                WhatsApp
            </button>

        </div>
        `;
    }).join("");
}

/* ================= BUSCADOR ================= */
buscador.oninput = ()=>{
    if(vista==="categorias") renderCategorias();
    else renderLista();
};

/* ================= VOLVER ================= */
volver.onclick = ()=>{
    buscador.value="";
    renderCategorias();
};
