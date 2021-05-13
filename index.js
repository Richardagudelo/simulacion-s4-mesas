const express = require("express");
const app = express();
const fetch = require("node-fetch");
const { data, error } = require("./logging/logger");
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const logger = require("./logging/logger");

//----------------------HOST de estaciones----------------
const hostMeseros = "https://waiters-simulation-api.herokuapp.com";
const hostCaja = "https://restaurantsimulation.herokuapp.com";
const hostClientes = "https://agente-cliente.herokuapp.com";
//------Inicialización de mesas y de cola de espera----------------
const cantidadMesas = 28;
let mesas = [];
let clientesEnEspera = [];
crearMesas();
asignarMesa();
let countOrders = 0;
//----------------------------------------------INICIALIZACION-------------------
/**
 * Creación de mesas
 */
function crearMesas() {
  for (let index = 0; index < cantidadMesas; index++) {
    mesas.push({
      id_mesa: index + 1,
      capacidad: 5,
      clientes: [],
      metodo_pago: "",
      estado: "LIMPIO",
      hora: "",
    });
  }
}

/**
 * Revisa si hay clientes en la lista de espera y los asigna a una mesa desocupada
 */
function asignarMesa() {
  setInterval(() => {
    if (clientesEnEspera[0]) {
      let mesaDesocupada = obtenerMesaDesocupada();
      if (mesaDesocupada) {
        mesaDesocupada.clientes = clientesEnEspera[0];
        mesaDesocupada.hora = new Date();
        clientesEnEspera.splice(0, 1);
        solicitarMenu().then((data) => {
          console.log("Menu recibido: ", data);
          enviarMenuyMesa(data, mesaDesocupada).then((data) => {
            console.log("Orden recibida", data);
            let ordenMesa = data;
            actualizarClientesMesa(ordenMesa);
            tomarOrden(ordenMesa).then((data) => {
              console.log("Orden enviada a meseros", data);
            });
          });
        });
      }
    }
    //console.log("-------------------MESAS-------------------------");
    //console.log(mesas);
    //console.log(clientesEnEspera);
  }, 1000);
}

//----------------------------------------------
app.get("/", (req, res) => {
  res.send("Mesas funcionando !");
});

/**
 *Agrega grupos de clientes a las mesas. Si el grupo tiene mas de 5 personas en dividido en varias mesas
 */
app.post("/agregarClientes", (req, res) => {
  let nuevosClientes = req.body;
  let cantidadNuevasMesas = Math.ceil(nuevosClientes.length / 5);
  for (let index = 0; index < cantidadNuevasMesas; index++) {
    clientesEnEspera.push(nuevosClientes.splice(0, 5));
  }
  res.status(200).json({ message: "Clientes agregados" });
});

/**
 * Los clientes que fueron asignados a la mesa envían los platos que eligieron a partir del menú que se envía
 */
app.post("/generarOrden", (req, res) => {
  let ordenMesa = req.body;
  actualizarClientesMesa(ordenMesa);
  tomarOrden(ordenMesa).then((data) => {
    res.status(200).json({ message: "Orden recibida por meseros" });
  });
});

/**
 * EL pedido de la mesa con idMesa es completado por parte de los meseros
 */
app.get("/servirMesa/:idMesa", (req, res) => {
  //Contar tiempo que el cliente dura comiendo
  //Enviamos a clientes la mesa con el id del encargado
  enviarOrdenAPago(
    mesas.find((mesa) => mesa.id_mesa == req.params.idMesa),
    req.query.encargado
  );
  res.status(200).json({ message: "Orden servida" });
});

/**
 * El estado de la mesa con idMesa es cambiado a LIMPIO
 */
app.put("/limpiarMesa/:idMesa", (req, res) => {
  let idMesa = req.params.idMesa;
  actualizarEstadoMesa(idMesa);
  res.status(200).json({ message: "Mesa limpiada :D" });
});

app.get("/mesas", (req, res) => {
  res.status(200).json({ mesas: mesas });
});

function actualizarClientesMesa(mesaActualizada) {
  let mesa = mesas.find((mesa) => mesa.id_mesa == mesaActualizada.id_mesa);
  mesa.clientes = mesaActualizada.clientes;
  mesa.metodo_pago = mesaActualizada.metodo_pago;
  mesa.tiempo_consumo = mesaActualizada.tiempo_consumo;
}

/**
 * Busca una mesa en la lista que esté desocupada
 * @returns
 */
function obtenerMesaDesocupada() {
  for (const mesa of mesas) {
    if (mesa.clientes.length == 0 && mesa.estado == "LIMPIO") {
      return mesa;
    }
  }
}

function formatOrder(orderCliente) {
  let orderFormated = {
    id: countOrders,
    id_mesa: orderCliente.id_mesa,
    estado: "transito a cocinca",
    ordenes: [],
  };
  orderCliente.clientes.forEach((cliente) => {
    orderFormated.ordenes.push({
      id_cliente: cliente.id_cliente,
      platos: cliente.platos,
    });
  });
  countOrders++;
  return orderFormated;
}

/**
 * Cuando la orden fue servida inicia el proceso de pago
 * @param {*} mesa
 */
function enviarOrdenAPago(mesa, encargado) {
  let mesaAPagar = mesa;
  mesaAPagar.id_encargado = encargado;
  realizarPago({ mesa: mesaAPagar })
    .then((data) => {
      console.log("----------------------------------------");
      console.log("!Pago aceptado: !", data);
      limpiarMesa(data.factura.id_mesa);
    })
    .catch((error) => console.log(error));
}

/**
 * Retirar clientes de la mesa y solicitar limpiarlos
 * @param {*} idMesa
 */
function limpiarMesa(idMesa) {
  let mesa = mesas.find((mesa) => mesa.id_mesa == idMesa);
  mesa.clientes = [];
  mesa.estado = "NOLIMPIO";
  mesa.metodo_pago = "";
  solicitarLimpiadoDeMesa(idMesa).then((data) => {
    console.log(data);
  });
}

/**
 * Cambia el estado de una mesa a limpio
 * @param {*} idMesa
 */
function actualizarEstadoMesa(idMesa) {
  mesas.find((mesa) => mesa.id_mesa == idMesa).estado = "LIMPIO";
}

/**
 * Función para elegir metodo de pago
 */
function elegirMetodoDePagoAleatorio() {
  const metodosPago = ["Dividido", "Americano", "Unico"];
  return metodosPago[Math.floor(Math.random() * 2)];
}

/**
 * Servicio para solicitar menu a meseros
 * @returns
 */
async function solicitarMenu() {
  return await fetch(hostMeseros + "/waiters/v1/menu", { method: "GET" }).then(
    (res) => res.json()
  );
}

/**
 * Servicio para enviar pedido de mesa a meseros
 * @param {*} orden
 * @returns
 */
async function tomarOrden(orden) {
  return await fetch(hostMeseros + "/waiters/v1/order", {
    method: "POST",
    body: JSON.stringify(orden),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
}

async function solicitarLimpiadoDeMesa(idMesa) {
  return await fetch(hostMeseros + `/waiters/v1/clean?tableId=${idMesa}`, {
    method: "POST",
  }).then((res) => res.json());
}

async function realizarPago(body) {
  return await fetch(hostCaja + "/tables/new", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
}

async function enviarMenuyMesa(menu, mesa) {
  let body = {
    mesa: mesa,
    menu: menu,
  };

  return await fetch(hostClientes + "/clientes/ordenar", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
}

app.listen(port, () => {
  logger.info(`Mesas listening at http://localhost:${port}`);
});
