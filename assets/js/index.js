const checkboxContainer = document.getElementById("checkbox-container")
const cardsContainer = document.getElementById("cards-container")
const detailsContainer = document.getElementById("details-container")
const membersContainer = document.getElementById("members-container")
let searchId = document.getElementById("searchId")
let checkboxItems = Array.from(document.querySelectorAll(".check-item"))

async function getVinos() {
  let response = await fetch("https://api-luxe-drive.onrender.com/vinos")
  let position = location.search.slice(1)
  let pathname = location.pathname
  let data = await response.json()

  if (pathname == "/pages/members.html") {
    let membersSubscriptions = data.servicios
    membersSubscriptions.forEach(createCardMembershipInfo)
  }

  if (pathname == "/pages/contact.html") {
    let form = document.querySelector("form")
    let modal = document.getElementById("modal")

    function actionForm(e) {
      e.prvinoDefault()
      let formData = {
        email: e.target[1].value,
        name: e.target[0].value,
        message: e.target[2].value
      }
      form.classList.add("visibility-hidden", "h-25")
      modalTemplate = `
          <h3 class="mb-2 text-center">Gracias <b>${formData.name}</b></h4>
          <h5 class="m-3 text-center">Tu mensaje: <i>${formData.message}</i></p>
          <p class="m-3 text-center">ha sido enviado correctamente.</p>
          <p class="mb-2 text-center">¡Pronto te redireccionaremos al inicio!</p>
      `
      modal.innerHTML += modalTemplate
      setTimeout(() => { window.location.pathname = "/index.html" }, 10000)
    }
    form.addEventListener("submit", function (e) { actionForm(e) })
  }

  if (pathname == "/pages/details.html") {
    let id = location.search.slice(1)

    vinosData = data.vinos
    let vinoDetails = vinosData.filter(vino => id == vino.id)

    // oculto flechas de navegacion, seteo nombre del vino
    const leftArrow = document.getElementById("leftArrow")
    const rightArrow = document.getElementById("rightArrow")
    const menuTitle = document.getElementById("current")
    leftArrow.style.visibility = "hidden"
    menuTitle.textContent = vinoDetails[0].name
    rightArrow.style.visibility = "hidden"

    // crear detalles de un vino
    function createDetails(e) {
      let detailsTemplate

        detailsTemplate = `
          <img src="${e.image}" class="details-img mt-4 mb-4 align-center">
          <h5 class="mb-3 text-center">${e.description}</h4>
          <p class="mb-2 text-center">Su coste es de $${e.price} la botella.</p>
         
        `
      detailsContainer.innerHTML += detailsTemplate
    }
    createDetails(vinoDetails[0])

  }

  if (pathname == "/index.html" || pathname == "/") {
    const leftArrow = document.getElementById("leftArrow")
    const rightArrow = document.getElementById("rightArrow")
    const menuTitle = document.getElementById("current")

    // Checkear si esta en pag vinos seleccionados
    if (position == "ourselection") {
      let filteredVinos = data.vinos.filter((vino) => {
        return vino.selection == true
      })
      vinosData = filteredVinos
      leftArrow.href = "./index.html"
      menuTitle.textContent = "Vinos Seleccionados"
      rightArrow.href = "./pages/members.html"
    }

    // Si esta en index, datos tal cual
    if (position == "index" || position == "") {
      vinosData = data.vinos
      leftArrow.href = "./pages/statistics.html"
      menuTitle.textContent = "Inicio"
      rightArrow.href = "./index.html?ourselection"
    }
    // llamar creacion de cartas
    vinosData.forEach(createCard)
    // inicializo el debounce 
    const filter = debounce(() => filterCards())
    // crear categorias checkboxes
    const checkboxCepas = new Set(vinosData.map(e => e.cepa))
    checkboxCepas.forEach(createCheckbox)
    const checkboxColor = new Set(vinosData.map(e => e.color))
    checkboxColor.forEach(createCheckbox)
    let checkboxItems = Array.from(document.querySelectorAll(".check-item"))
    checkboxItems.forEach(checkbox => checkbox.addEventListener('click', filter))
    // eventlistener para el filtro de texto
    searchId.addEventListener('input', filter)
    searchId.classList.remove("visibility-hidden")
    // filtro por checkbox
    function checkboxFilterCepas(vino) {
      let filter = checkboxItems.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value)
      if (filter.length !== 0) {
        filter = vino.filter(vino => filter.includes(vino.cepa))
        return filter
      }
      return vino
    }
    function checkboxFilterColor(vino) {
      let filter = checkboxItems.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value)
      if (filter.length !== 0) {
        filter = vino.filter(vino => filter.includes(vino.color))
        return filter
      }
      return vino
    }
    // filtro de cartas
    function filterCards() {
      let checksFilterCepas = checkboxFilterCepas(vinosData)
      let checksFilterColor = checkboxFilterColor(vinosData)
      let checksFilter = checksFilterCepas
        .concat(checksFilterColor
          .filter((item) => checksFilterCepas.indexOf(item) < 0))

      let filteredSearch = searchFilter(checksFilter, searchId.value)
      if (filteredSearch.length !== 0) {
        cardsContainer.innerHTML = ``
      }
      filteredSearch.forEach(createCard)
    }

  }
}
// crear checkboxs
function createCheckbox(e) {
  checkboxContainer.innerHTML += `
  <label class="d-flex justify-between">
  <input class="checkbox check-item" value="${[e]}" type="checkbox">
  <div class="checkmark mx-2"><span class="category">${[e]}</span></div>
  </label>
  `
}
// filtro de busqueda
function searchFilter(arr, text) {
  let filter = arr.filter(vino => vino.name.toLowerCase().includes(text.toLowerCase()))
  if (filter.length === 0) {
    cardsContainer.innerHTML = `
    <div>
    <h3 class="text-center">No encontrado</h3>
    </div>
    `
    return []
  }
  return filter
}
// crear cartas
function createCard(e) {
  cardsContainer.classList.add("row", "row-cols-1", "row-cols-sm-2", "row-cols-md-3", "row-cols-xl-3", "row-cols-xxl-4", "align-content-center", "m-4", "justify-content-center")
  let cardTemplate = `
  <div id="card-${e.id}" class="card m-1 container-vertical justify-evenly">
  <div class="card-body">
  <h5 class="d-flex justify-content-center align-content-center card-title">${e.name}</h5>
  <div class="d-flex justify-content-center pb-3">
  <img src="${e.image}" class="card-img-top card-img mt-2 mb-2" alt="${e.name}">
  <div class="d-flex px-3 pt-2 container-vertical justify-content-center">
  <p class=" card-description">${e.cepa}</p>
   <p class=" card-description">${e.subtipo}</p>
  <p class=" card-description">${e.color}</p>
  <!--  <p class="d-flex justify-content-center align-items-center card-description">${e.description}</p>-->
  </div>
  </div>
  <p class="d-flex card-text col align-self-center"><b>$${e.price}</b></p>
  <div class="d-flex row-2 justify-content-center">
  <a href="/pages/details.html?${e.id}" class="btn btn-primary h-100 w-50">Mas Detalles</a>
  </div>
  </div>
  </div>
  `
  cardsContainer.innerHTML += cardTemplate
}

function createCardMembershipInfo(e) {
  if (e.name == "Unete a nuestro Club") {
  infoTemplate = `
    <div class="m-4 member-card">
      <h4 class="title text-center">${e.name}</h4>
    </div>
    <p class="description text-center">${e.description}</p>
    `
  } else if (e.name == " "){
  infoTemplate = `
    <div class="m-4">
      <p class="description text-center">${e.description}</p>
    </div>
    `
  } else {
    infoTemplate = `
    <div class="m-4 member-card">
      <h4 class="title mb-4">${e.name}</h4>
      <p class="description">${e.description}</p>
    </div>
    `
  }
  membersContainer.innerHTML += infoTemplate
}

// debounce para que la ejecucion del filtrado ocurra luego de terminar de tipear
function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

getVinos()