const DATA_URL = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/data.json";

let profesionales = [];
let vista = "categorias";
let categoriaActual = null;

/* ================= UI ================= */
document.body.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box;}

body{
    font-family:"Segoe UI", Arial, sans-serif;
    background: linear-gradient(135deg,#0f172a,#1e293b,#111827);
    min-height:100vh;
    color:white;
}

header{
    text-align:center;
    padding:25px 15px;
    background:rgba(255,255,255,.05);
    backdrop-filter:blur(12px);
}

h2{margin-bottom:10px;}

input{
    width:min(650px,90%);
    padding:11px;
    border:none;
    border-radius:10px;
    background:rgba(255,255,255,.12);
    color:white;
    outline:none;
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
    grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
    gap:12px;
    padding:20px;
}

.card-cat,.card-prof{
    background:rgba(255,255,255,.08);
    border-radius:14px;
    padding:12px;
    transition:.2s;
    cursor:pointer;
}

.card-cat:hover,.card-prof:hover{
    transform:scale(1.03);
    background:rgba(255,255,255,.12);
}

.badge{
    display:inline-block;
    padding:3px 8px;
    font-size:11px;
    border-radius:999px;
    background:rgba(59,130,246,.25);
}

/* BOTONES */
.btn{
    display:inline-block;
    margin-top:8px;
    padding:8px 10px;
    border-radius:10px;
    text-decoration:none;
    font-size:12px;
    font-weight:bold;
    text-align:center;
    cursor:pointer;
}

.btn-wa{background:#22c55e;color:white;}
.btn-tel{background:#3b82f6;color:white;}
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
function norm(t){
    return (t || "").toLowerCase().trim();
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
    if(c.includes("carpint")) return base+"carpintero.png";
    if(c.includes("pint")) return base+"pintor.png";

    return base+"default.png";
}

/* ================= HORARIO UNIVERSAL ================= */
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

    let data = h[hoy];

    /* ===== STRING ===== */
    if(typeof data === "string"){

        if(data.toLowerCase()==="cerrado")
            return {estado:"cerrado", texto:"🔴 Cerrado"};

        if(data.includes("24") || data==="00:00-00:00")
            return {estado:"abierto", texto:"🟢 Abierto todo el día"};

        const m = data.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
        if(!m) return {estado:"abierto", texto:"🟢 Abierto"};

        let ini = parseInt(m[1])*60 + (m[2]?parseInt(m[2]):0);
        let fin = parseInt(m[3])*60 + (m[4]?parseInt(m[4]):0);

        if(minutos >= ini && minutos < fin){
            return {
                estado:"abierto",
                texto:`🟢 Abierto · cierra en ${fin-minutos} min`
            };
        }

        if(minutos < ini){
            return {
                estado:"cerrado",
                texto:`🔴 Cerrado · abre en ${ini-minutos} min`
            };
        }

        return {estado:"cerrado", texto:"🔴 Cerrado"};
    }

    /* ===== OBJETO NUEVO ===== */
    if(typeof data === "object" && data.abre){

        let [h1,m1]=data.abre.split(":").map(Number);
        let [h2,m2]=data.cierra.split(":").map(Number);

        let ini = h1*60 + (m1||0);
        let fin = h2*60 + (m2||0);

        if(minutos >= ini && minutos < fin){
            return {
                estado:"abierto",
                texto:`🟢 Abierto · cierra en ${fin-minutos} min`
            };
        }

        if(minutos < ini){
            return {
                estado:"cerrado",
                texto:`🔴 Cerrado · abre en ${ini-minutos} min`
            };
        }
    }

    return {estado:"cerrado", texto:"🔴 Cerrado"};
}

/* ================= AGRUPAR ================= */
function agrupar(lista){
    const g={};
    lista.forEach(p=>{
        const c = p.categoria || "Otros";
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
            <img src="${icono(cat)}" width="45">
            <div>${cat}</div>
        </div>
    `).join("");
}

/* CLICK FIX */
contenedor.addEventListener("click",(e)=>{
    const card = e.target.closest(".card-cat");
    if(!card) return;

    categoriaActual = card.dataset.cat;
    verCategoria();
});

function verCategoria(){
    vista="lista";
    volver.style.display="block";
    renderLista(filtrar(profesionales));
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

        if(vista==="lista"){
            return norm(p.categoria) === norm(categoriaActual) && txt.includes(t);
        }

        return txt.includes(t);
    });
}

/* ================= RENDER ================= */
function renderLista(list){

    contenedor.innerHTML = list.map(p=>{
        const e = estadoHorario(p.horario);

        return `
        <div class="card-prof">

            <img src="${icono(p.categoria)}" width="40">

            <b>${p.nombre}</b>
            <div class="badge">${p.categoria}</div>

            <p>📍 ${p.ciudad || ""}</p>
            <p>🏠 ${p.direccion || ""}</p>

            <p style="font-weight:bold;margin-top:6px;">
                ${e.texto}
            </p>

            <a class="btn btn-tel" href="tel:${p.telefono}">
                📞 Llamar
            </a>

            <a class="btn btn-wa" href="https://wa.me/${p.whatsapp}" target="_blank">
                💬 WhatsApp
            </a>

        </div>
        `;
    }).join("");
}

/* ================= BUSCADOR ================= */
buscador.oninput=()=>{
    if(vista==="categorias") renderCategorias();
    else renderLista(filtrar(profesionales));
};

/* ================= VOLVER ================= */
volver.onclick=()=>{
    buscador.value="";
    renderCategorias();
};
