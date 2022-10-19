/* -------------------------------------------------------------------------------------------- */
/* --------------------------------------FUNCTIONS--------------------------------------------- */
/* -------------------------------------------------------------------------------------------- */
function qs(element){
    return document.querySelector(element);
}

let printCards = (array, container)=>{
    container.innerHTML = '';
    if(array.length != 0){
        array.forEach((event, i)=>{
            let card = document.createElement('div')
            card.className = "card m-2"
            card.style.width = '18rem'
            card.innerHTML = `
                <img src=${array[i].image} class="card-img-top" alt="...">
                <div class="card-body  text-center">
                    <h5 class="card-title">${array[i].name}</h5>
                    <p class="card-text">${array[i].description}</p>
                    <a href="#" class="btn btn-outline-success">Buy</a>
                    <a href="detail.html?id=${array[i]._id}" class="btn c3">Details</a>
                </div>`
            container.appendChild(card);
        })
    } else {
        let error = document.createElement('div');
        error.innerHTML = `
        <h3 class = 'text-center' >Ups!... no results found</h3>
        <img src='./assets/img/no-results.svg' class="card-img-top" alt="...">
        
        `
        container.appendChild(error);
    }
}

let printDetail = (event, container)=>{
    let detail = document.createElement('div');
    detail.className = 'card';
    detail.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4 img-card">
                <img src="${event.image}" class="img-fluid rounded-start" alt="...">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">${event.name}</h5>
                    <p class="card-text">${event.description}</p>
                    <p>Date: ${event.date} <span class="float-r">Category: ${event.category}</span></p>
                    <p>
                        Capacity: ${event.capacity} <span class="float-r">
                        ${event.assistance == undefined ? 'Estimate: ' + event.estimate : 'Assistance: ' + event.assistance}</span></p>
                    <p>Price: $${event.price} <span class="float-r">Place: ${event.place}</span></p>
                    <a href="#" class="btn btn-outline-success text-center">Buy</a>
                </div>
            </div>
        </div>`
    container.appendChild(detail);
}

const allCategories = (data) =>{
    let categories = [];
    data.forEach(event => categories.push(event.category))
    categories = categories.filter((item, i) => categories.indexOf(item) === i)
    return categories;
}

const printCategories = (data, container) => {
    let categories = allCategories(data);
    categories.forEach((category, i)=> {
        let checkbox = document.createElement('div');
        checkbox.className = "form-check form-check-inline"
        checkbox.innerHTML = `
        <input class="form-check-input" type="checkbox" id="cat${i}" value="${category}">
        <label class="form-check-label" for="cat${i}">${category}</label>`
        container.appendChild(checkbox);
    })
}

const filterBySearch = (input, data) => {
    let querySearch = input.value.toLowerCase().trim();
    let result = data.filter((event) => {
        return event.name.toLowerCase().includes(querySearch);
    })
    return result;
}

const filterByCategory = (data) => {
    let checkBoxes = document.querySelectorAll('.form-check-input');
    let arrayChecks = Array.from(checkBoxes);
    let checkOn = arrayChecks.filter( checkBox => checkBox.checked);
    let categoryOn = checkOn.map(check => check.value);

    if(categoryOn.length == 0){
        return data;
    }

    let result = data.filter(event => categoryOn.includes(event.category));
    return result;
}

const allFilters = (input, data) =>{
    let resultByText = filterBySearch(input, data);
    let resultByCategory = filterByCategory(resultByText);
    printCards(resultByCategory, cardContainer);
}

const filtersOn = (searchElement, dataFilter) => {
    let checks = document.querySelectorAll('.form-check-input');

    searchElement.addEventListener('keyup', e => {
        allFilters(searchElement, dataFilter)
    })

    checks.forEach((item) => {
        item.addEventListener('input', e => {
            allFilters(searchElement, dataFilter)
        })
    })
}

const getDetail = (url, id, container) => {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let eventDetail = data.events.find(event => event._id == id);
            printDetail(eventDetail, container)
        })
}
/* ------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */
let allEvents;
let path = location.pathname;
let cardContainer = qs('.collection-cards');
let categoryContainer = qs('.conteiner-checkbox');
let inputSearch = qs('.form-control');
const URI = 'https://amazing-events.herokuapp.com/api/events';

//getData(URI, path)

//Implemetacion
switch(true){
    case path.includes('contact'):
        getStats(URI)
        break;
    case path.includes('stats'):
        getStats(URI)
        break;
    case path.includes('detail'):
        let detailContainer = qs('#detail');
        let queryString = location.search;
        let params = new URLSearchParams(queryString);
        let id = params.get('id');

        getDetail(URI, id, detailContainer)
        break;
    default:
        getData(URI, path)

}


/* ------------------------------------------------------------------------------------------ */
const CONTACT = qs('#form-contact');

if(CONTACT) {
    CONTACT.addEventListener('submit', e => {
        //aca poner un condicional en para comprobar los campos
        e.preventDefault();
        Swal.fire({
            title: 'Message sent !',
            text: 'Thank you for contacting us',
            icon: 'success',
            confirmButtonText: 'Continue'
        })
        /* Swal.fire({
            title: 'Error!',
            text: 'Fill in all the fields',
            icon: 'error',
            confirmButtonText: 'Continue'
        }) */
    })
}

/* ------------------------------------------------------------------------------------------ */

function getData(url, path) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            switch(true){
                case path.includes('past'):
                    allEvents = data.events.filter(e => e.date < data.currentDate);
                    break;
                case path.includes('upcoming'):
                    allEvents = data.events.filter(e => e.date > data.currentDate);
                    break;
                default:
                    allEvents = data.events;
            }
            printCategories(allEvents, categoryContainer);
            printCards(allEvents, cardContainer);
            filtersOn(inputSearch, allEvents);
        })
        .catch('error')
}


/* ------------------------------------------------------------------------------------------ */

function getStats(url, container) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let stats = [];
            let allEvents = data.events;
            let pastEvents = allEvents.filter(e => e.date < data.currentDate);
            let upEvents = allEvents.filter(e => e.date > data.currentDate);
            allEvents.sort((a, b) => a.capacity - b.capacity);
            pastEvents.sort((a, b) => (a.assistance / a.capacity) - (b.assistance / b.capacity));

            stats.push(pastEvents[29]); //hight assistance
            stats.push(pastEvents[0]); //low assistance
            stats.push(allEvents[49]); //hight capacity
            console.table(stats)

            let pastCat = allCategories(pastEvents);
            let upCat = allCategories(upEvents);
            //console.table(pastCat)
            //console.table(upCat)
            let pastStats = getAllStats(pastEvents, pastCat);
            let upStats = getAllStats(upEvents, upCat);


            const tableGeneral = qs('#table1');
            const tableUp = qs('#table2');
            const tablePast = qs('#table3');
            printGeneralStatic(stats, tableGeneral)
            printTableRow(upStats, tableUp);
            printTableRow(pastStats, tablePast);


        })
}
/* ------------------------------------------------------------------------------------------ */
//ToDo: el buscador no funciona con la x, hacer un preventD el el form del buscador, en eventos pasados evitar que se pueda comprar

const getAllStats = (data, categories) => {
    let result = [];

    categories.forEach(category => {
        let cat = {
            name : category,
            revenue : 0,
            percent : 0,
            events: 0
        }

        data.forEach(event => {
            if(event.category == category) {
                cat.revenue = cat.revenue + (event.price * (event.assistance ?? event.estimate))
                cat.percent = cat.percent + ((event.assistance ?? event.estimate) / event.capacity) * 100
                cat.events = cat.events + 1
            }
        })
        cat.percent = (cat.percent / cat.events).toFixed(2);
        result.push(cat);
    })
    return result;
}


const printTableRow = (data, container) => {
    container.innerHTML = '';
    if(data.length != 0){
        data.forEach((event, i)=>{
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${data[i].name}</td>
                <td>$ ${data[i].revenue.toLocaleString()}</td>
                <td>${data[i].percent}%</td>
            `
            container.appendChild(row);
        })
    } else {
        let error = document.createElement('div');
        error.innerHTML = `
        <h3 class = 'text-center' >Ups!... no results found</h3>
            <img src='./assets/img/no-results.svg' class="card-img-top" alt="...">
            
        `
        container.appendChild(error);
    }
}

const printGeneralStatic = (data, container) => {
    container.innerHTML = '';
    if(data.length != 0){



        data.forEach((event, i)=>{
            let cell = document.createElement('td');
            cell.innerHTML = `
                <a href="detail.html?id=${data[i]._id}">${data[i].name}</a>
            `
            container.appendChild(cell);
        })
    } else {
        let error = document.createElement('div');
        error.innerHTML = `
        <h3 class = 'text-center' >Ups!... no results found</h3>
            <img src='./assets/img/no-results.svg' class="card-img-top" alt="...">
            
        `
        container.appendChild(error);
    }
}

//Mi codigo esta horrible pero debo pasarlo a vue adsfsdafasdfsdafsfsadf 
//TODO limpiar y organizar el codigo
//TODO trabajar en front