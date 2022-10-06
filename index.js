class Manga {
    constructor(id, marca, formato, titulo, autor, stock, precio, img){
        this.id = id;
        this.marca = marca;
        this.formato = formato;
        this.titulo = titulo;
        this.autor = autor;
        this.stock = stock;
        this.precio = precio;
        this.img = img;
    }
    Venta(cantidad){
        if(this.stock > 0){this.stock -= cantidad;}
        else{alert(`Sin stock. Disculpe la molestia.`)}
    }
    
}

let carrito = [];

const contenedor = document.getElementById("contenedor");
const carritoComprasHTML = document.getElementById("carrito");
const totalCompra = document.getElementById("total");
const vaciar = document.getElementById("boton-vaciar");
const comprar = document.getElementById("realizar-compra");
const mangasVendidos = document.getElementById("mangas-vendidos");
const listaVentas = document.getElementById("ver-ventas");

const cargarMangasJSON = async () => {
    let response = await fetch("./mangas.json");
    let mangas = await response.json();
    localStorage.setItem("mangasGuardados", JSON.stringify(mangas));
}

cargarMangasJSON();

//mostrar productos en la pagina
let mangasGuardados = JSON.parse(localStorage.getItem("mangasGuardados"));
mangasGuardados.forEach(producto => {
    let {id, titulo, autor, marca, formato, precio, stock, img} = producto;
    const div = document.createElement(`div`);  
    let agregar = `<button class="boton" id="agregar-prod", onclick="agregarProducto(${id})"><div id="icono"><i class="bi bi-cart-plus"></i></div> <div>Agregar al carrito</div></button>
    </div>
    `;
    let sinStock = `<p><b>Sin Stock</b></p>
    </div>
    `;
    let divHTML = `
        <div class="mostrar-productos">
            <div class="div-imagen">
            <img class="imagen-manga" src="${img}">
            </div>
            <h3 class="titulo-manga">"${titulo}"</h3>
            <p>Autor: ${autor}<br>
            Editorial: ${marca} <br>
            Formato: ${formato}<br>
            Precio: <b>$${precio}</b></p>`;
    stock > 0 ? divHTML +=agregar : divHTML +=sinStock;
    div.innerHTML +=divHTML;
    contenedor.append(div);
});

//Carrito de compras
let guardarCarrito = () => {
    localStorage.setItem("carritoStorage", JSON.stringify(carrito));
}

let eliminarProdCarrito = (id) => {
    carrito[id].cantidad--;
    carrito[id].cantidad === 0 && carrito.splice(id, 1);
    guardarCarrito();
    renderizarCarrito();
    calcularTotal();
};

let vaciarCarrito = () => {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    calcularTotal();
}

let vaciarCarritoConfirmar = () => {
    Swal.fire({
        title: 'Vaciar el Carrito',
        text: "Está seguro que desea vaciar el carrito?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Vaciar!'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Carrito vacio',
            'Los productos se borraron correctamente',
            'success'
          )
          carrito = [];
          guardarCarrito();
          renderizarCarrito();
          calcularTotal();
        }
      })
}

vaciar.addEventListener("click", vaciarCarritoConfirmar);

let renderizarCarrito = () =>{
    let carritoHTML = "";
    carrito.forEach((prod, id) => {
        let {titulo, precio, cantidad} = prod;
        carritoHTML += `
        <div class="prod-en-carrito">
            <h3>"${titulo}"</h3>
            Cantidad: <b>${cantidad}</b><br>
            <p>Precio: <span id="total">$${precio}</span></p><br>
            <button class="boton" onclick="eliminarProdCarrito(${id})">Eliminar<i class="bi bi-cart-dash"></i></button><br><br>
        </div>            
        `
    });
    carritoComprasHTML.innerHTML = carritoHTML;
}

let calcularTotal = () => {
    let total = 0;
    carrito.forEach(prod => {
        let {precio, cantidad} = prod;
        total += precio * cantidad;
    });
    totalCompra.innerHTML = `<b>$${total}</b>`;
};

//Buscar productos cargados anteriormente
let carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));

if(carritoStorage){
    carrito = carritoStorage;
}
renderizarCarrito();
calcularTotal();


//argregar productos al carrito de compras
let mensajeError = (titulo) => {
    Swal.fire({
        icon: 'error',
        title: 'Limite de stock',
        text: `Su pedido supera la cantidad disponible de: "${titulo}"`,
      })
}

const agregarProducto = (id) => {
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Producto agregado al carrito',
        showConfirmButton: false,
        timer: 1500
      })
    let producto = mangasGuardados.find((producto) => producto.id === id);
    let productoEnCarrito = carrito.find(producto => producto.id === id);
    if (productoEnCarrito){
        producto.cantidad < mangasGuardados[id-1].stock ? producto.cantidad++ : mensajeError(producto.titulo);
    } else {
        producto.cantidad = 1
        carrito.push(producto);
    }
    guardarCarrito();
    renderizarCarrito();
    calcularTotal();
} 


//Realizar la compra(disminuye la cantidad de stock disponible)
let guardarMangasLS = () => {
    localStorage.setItem("mangasGuardados", JSON.stringify(mangasGuardados));
}

let realizarCompra = () => {
    if(carrito.length !== 0){
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Gracias por su compra!',
            showConfirmButton: false,
            timer: 1500
          });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'El carritio está vacío!',
          })
    }
    
    for(const prod of carrito){
        console.log(prod);
        let pos = prod.id - 1;
        console.log(mangasGuardados[pos])
        mangasGuardados[pos].stock -= prod.cantidad;
        mangasGuardados[pos].cantidadVendida ? mangasGuardados[pos].cantidadVendida += prod.cantidad : mangasGuardados[pos].cantidadVendida = prod.cantidad;
    }
    guardarMangasLS();
    vaciarCarrito();
};

comprar.addEventListener("click", realizarCompra)

//ver ventas realizadas
let cerrarListaVentas = () => {
    listaVentas.innerHTML = "";
}

let verVentas = () => {
    const table = document.createElement(`table`);
    let ventasTotales = 0;
    let recaudadoFinal = 0;
    let tablaHTML = `<table id="tabla">
    <tr>
    <th>Titulo</th>
    <th>Cantidad vendida</th>
    <th>Total recaudado</th>
    </tr>`
    for (const producto of mangasGuardados) {
        if(producto.cantidad>0){
            let totalRecaudado = producto.precio * producto.cantidadVendida;
            ventasTotales += producto.cantidadVendida;
            recaudadoFinal += totalRecaudado;
            let fila = `<tr><td>${producto.titulo}</td><td class="fila">${producto.cantidadVendida}</td><td class="fila">$${totalRecaudado}</td></tr>`;
            tablaHTML += fila;
        }
    }
    tablaHTML += `<tr><td>Cantidad Total</td><td class="fila">${ventasTotales}</td><td class="fila">$${recaudadoFinal}</td></tr>
    </table>`
    let botonCerrar = `<button class="boton" id="cerrar" onclick="cerrarListaVentas()">Cerrar</button>`;
    tablaHTML += botonCerrar;
    listaVentas.append(table);
    listaVentas.innerHTML = tablaHTML;
}

mangasVendidos.addEventListener("click", verVentas);