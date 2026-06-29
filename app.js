const DATA_URL = "./data.json";

let profesionales = [];

document.body.innerHTML = `
<style>
body {
    font-family: Arial;
    margin: 0;
    background: #f4f4f4;
}

header {
    background: #222;
    color: white;
    padding: 15px;
    text-align: center;
}

input {
    width: 90%;
    padding: 10px;
    margin-top: 10px;
    border-radius: 8px;
    border: none;
}

#contenedor {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
    padding: 10px;
}

.card {
    background: white;
    padding: 12px;
    border-radius: 10px;
}

.card a {
    display: inline-block;
    margin-top: 8px;
    background: green;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    text-decoration: none;
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
