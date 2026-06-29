const DATA_URL = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/data.json";

let profesionales = [];
let vista = "categorias";
let categoriaActual = null;

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
    border-bottom:1px solid rgba(255,255,255,.08);
}

h2{margin-bottom:10px;}

input{
    width:min(650px,90%);
    padding:11px 14px;
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
    grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
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

.card-prof:hover,.card-cat:hover{
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

function norm(t){ return (t||"").toLowerCase().trim(); }

// ================= DATA =================
fetch(DATA_URL)
.then(r=>r.json())
.then(data=>{
    profesionales = data;
    renderCategorias();
});

// ================= ICONOS =================
function icono(cat){
    const base = "https://arielfernandoavilarevillaredes-arch.github.io/mislkt3yihjiru5/icons/";
    const c = norm(cat);

    if(c.includes("plom")) return base+"plomero.png";
    if(c.includes("comput") || c.includes("celular")) return base+"computadora.png";
    if(c.includes("emerg")) return base+"emergencias.png";
    if(c.includes("electric")) return base+"electricista.png";
    if(c.includes("gas")) return base+"gasista.png";

    return base+"default.png";
}

// ================= HORARIOS =================
function estadoHorario(h){

    // 🔥 SIN HORARIO = SIEMPRE ABIERTO
    if(!h || h === "sin horario"){
        return {estado:"abierto", texto:"🟢 Abierto todo el día"};
    }

    const ahora = new Date();
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const hoy = dias[ahora.getDay()];
    const hora = ahora.getHours()*60 + ahora.getMinutes();

    const txt = h[hoy];

    if(!txt || txt.toLowerCase()==="cerrado"){
        return {estado:"cerrado", texto:"🔴 Cerrado"};
    }

    if(txt.includes("24") || txt.includes("00:00-00:00")){
        return {estado:"abierto", texto:"🟢 Abierto todo el día"};
    }

    const m = txt.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);

    if(!m) return {estado:"abierto", texto:"🟢 Abierto"};

    let ini = parseInt(m[1])*60 + (m[2]?parseInt(m[2]):0);
    let fin = parseInt(m[3])*60 + (m[4]?parseInt(m[4]):0);

    if(hora >= ini && hora < fin){
        return {
            estado:"abierto",
            texto:`🟢 Abierto · cierra en ${fin-hora} min`
        };
    }

    if(hora < ini){
        return {
            estado:"cerrado",
            texto:`🔴 Cerrado · abre en ${ini-hora} min`
        };
    }

    return {estado:"cerrado", texto:"🔴 Cerrado"};
}

// ================= AGRUPAR =================
function agrupar(lista){
    const g = {};
    lista.forEach(p=>{
        const c = p.categoria || "Otros";
        if(!g[c]) g[c]=[];
        g[c].push(p);
    });
    return g;
}

// ================= CATEGORÍAS =================
function renderCategorias(){
    vista="categorias";
    categoriaActual=null;
    volver.style.display="none";

    const grupos = agrupar(profesionales);

    contenedor.innerHTML = Object.keys(grupos).map(cat=>`
        <div class="card-cat" data-cat="${cat}">
            <div>${cat}</div>
        </div>
    `).join("");
}

// ================= CLICK =================
contenedor.onclick = (e)=>{
    const c = e.target.closest(".card-cat");
    if(!c) return;
    categoriaActual = norm(c.dataset.cat);
    verCategoria();
};

function verCategoria(){
    vista="lista";
    volver.style.display="block";
    renderLista(filtrar(profesionales));
}

// ================= FILTRO =================
function filtrar(list){
    const t = norm(buscador.value);

    return list.filter(p=>{
        const txt = `${p.nombre} ${p.categoria} ${(p.tags||[]).join(" ")} ${p.ciudad} ${p.direccion}`.toLowerCase();

        if(vista==="lista"){
            return norm(p.categoria)===categoriaActual && txt.includes(t);
        }
        return txt.includes(t);
    });
}

// ================= RENDER =================
function renderLista(list){

    list = [...list];

    contenedor.innerHTML = list.map(p=>{
        const e = estadoHorario(p.horario);

        return `
        <div class="card-prof">
            <b>${p.nombre}</b>
            <div class="badge">${p.categoria}</div>

            <p>📍 ${p.ciudad || ""}</p>
            <p>🏠 ${p.direccion || ""}</p>

            <p style="margin-top:6px;font-weight:bold;">
                ${e.texto}
            </p>

            <a href="tel:${p.telefono}">Llamar</a>
            <a href="https://wa.me/${p.whatsapp}" target="_blank">WhatsApp</a>
        </div>
        `;
    }).join("");
}

// ================= BUSCADOR =================
buscador.oninput = ()=>{
    if(vista==="categorias") renderCategorias();
    else renderLista(filtrar(profesionales));
};

// ================= VOLVER =================
volver.onclick = ()=>{
    buscador.value="";
    renderCategorias();
};
