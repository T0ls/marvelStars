// Market

document.addEventListener('DOMContentLoaded', function () {
	if (this.location != "http://localhost:3000/logged/market.html") {
		saveToLS("searchText", "");
		showMarket(0);
		saveToLS('pageNumber', 0);
		changePage(0);
		return;
	}
	const radioMarketplace = document.getElementById('btnradio1');
	const radioManageOrders = document.getElementById('btnradio2');
	const marketplaceGen = document.getElementById('marketplaceGenDiv');
	const manageOrdersGen = document.getElementById('manageOrdersGenDiv');
	
	const marketplaceCard = marketplaceGen.querySelector('.cascade-item-marketplace');
	const manageOrdersCard = manageOrdersGen.querySelector('.cascade-item-manageOrders');
	
	saveToLS("searchText", "");
	saveToLS('fineAddition', false);
	showMarket(0);
	showUserOrders();
	saveToLS('pageNumber', 0);
	changePage(0);

    marketplaceGen.style.display = 'block';
    manageOrdersGen.style.display = 'none';

	function resetAnimation() {
		// Rimuovo le classi di animazione per poterle riapplicare
		marketplaceCard.classList.remove('cascade-show-marketplace');
		manageOrdersCard.classList.remove('cascade-show-manageOrders');
	}

	// Al caricamento della pagina, mostra la card di Marketplace
	setTimeout(() => {
		marketplaceCard.classList.add('cascade-show-marketplace'); // Cambiato per l'animazione di "MarketPlace"
	}, 100);  // Ritardo per fluidità al caricamento

	radioManageOrders.addEventListener('change', function () {
		if (radioManageOrders.checked) {
			marketplaceGen.style.display = 'none';
			manageOrdersGen.style.display = 'block';

			// Resetta l'animazione per entrambe le sezioni
			resetAnimation();

			// Mostra l'animazione della card di Collection
			setTimeout(() => {
				manageOrdersCard.classList.add('cascade-show-manageOrders');
			}, 100);  // Ritardo per fluidità
		}
	});

	radioMarketplace.addEventListener('change', function () {
		if (radioMarketplace.checked) {
			manageOrdersGen.style.display = 'none';
			marketplaceGen.style.display = 'block';

			// Resetta l'animazione per entrambe le sezioni
			resetAnimation();

			// Mostra l'animazione della card di Open Packs
			setTimeout(() => {
				marketplaceCard.classList.add('cascade-show-marketplace');
			}, 100);  // Ritardo per fluidità
		}
	});
});

async function changePage(action) {
    let page = parseInt(getFromLS('pageNumber'), 10);
	const prevElement = document.getElementById("prevPage");
	const nextElement = document.getElementById("nextPage");
	const totalCharacters = await getTotalHeroesStartsW();
	// controlli x impostare nextPage
    if ((page+1)*20 > (totalCharacters-1)) {
		nextElement.classList.add("disabled");
	} else {
		nextElement.classList.remove("disabled");
	}

    if (action === 0) {
        // Previous
        if (page !== 0) {
            page--;
			if (page === 0) {
				prevElement.classList.add("disabled");
				nextElement.classList.remove("disabled");
			}
            saveToLS('pageNumber', page);
			showMarket(page*20);
        }
    } else if (action === 1) {
        // Next
        if ((page+1)*20 < totalCharacters) {
            page++;
			prevElement.classList.remove("disabled");
            saveToLS('pageNumber', page);
			changePage(2);
			showMarket(page*20)
        }
    }
}

function isValidString(str) {
    if (typeof str !== 'string' || str.trim() === '') {
        return false;
    }
    const regex = /^[a-zA-Z0-9 ()-]+$/;
    return regex.test(str);
}

async function searchFromBar() {
	saveToLS("pageNumber", 0);
	showMarket(0);
}

// imposto max width schede 
let figurinaImgs = document.querySelectorAll('.figurinaImg');

figurinaImgs.forEach(function(img, index) {
	let imgWidth = img.offsetWidth;
	let figurinaName = document.querySelectorAll('.figurinaName')[index];
	figurinaName.style.width = imgWidth + 'px';
	figurinaName.style.width = '100%';
});

const searchBar = document.getElementById('searchBar');
searchBar.addEventListener('input', function() {
	const query = searchBar.value;
	if (query.length > 2) {
		saveToLS("searchText", query);
		changePage(2);
		searchFromBar();
	} else if (query.length === 0) {
		saveToLS("searchText", "");
		changePage(2);
		searchFromBar();
	}
});

async function showItemMaketInfo(heroId) {
	const response = await fetch('http://localhost:3000/cards/getCards', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			"searchParam": "id",
			"cards": [heroId]
		})
	});
	if (response.ok) {
		// clear dei precedenti
		const container = document.getElementById('ordersContainerDiv');
		const children = Array.from(container.children);
		for (let i = 1; i < children.length; i++) {
			const child = children[i];
			if (child.tagName === 'DIV') {
				container.removeChild(child);
			}
		}

		const card = await response.json();
		const res = await fetch('http://localhost:3000/orders/getOrders', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ "search": [parseInt(card[0].cardId)] })
		});
		if (res.ok) {
			let orders = res.status === 204 ? null : await res.json();
			fillTable("buy", orders, heroId);

			fillTable("sell", orders, heroId);
		}
	} else {
		console.error('Error:', response.status, response.statusText);
	}
}

function fillTable(type, data, heroId) {
	//console.log(data)
    let container = document.getElementById('ordersContainerDiv');
    let template = document.getElementById('ordersTemplate');

    let clone = template.content.cloneNode(true);
    clone.querySelector('div').classList.add('generatedOrder');  // Aggiunto per distinguere

    const ordersNumberElement = clone.querySelector('.ordersNumber');
    const noOrdersElement = clone.querySelector('.noOrders');
    const typeButton = clone.querySelector('button');
    const tableElement = clone.querySelector('table');
    const tbodyElement = tableElement.querySelector('tbody');

	if (type === "buy") {
		typeButton.innerHTML = "Buy ...";
		typeButton.id = "marketBuyBtn";
		if (data === null) {
			ordersNumberElement.textContent = "Sorry 0 for sale, nothing to shop here!";
			noOrdersElement.classList.remove('d-none');
			tableElement.classList.add('d-none');
			container.appendChild(clone);
			return;
		} else {
			const url = location.href;
			const cleanUrl = url.split('#')[0];
			if (cleanUrl == "http://localhost:3000/unlogged/market.html") {
				typeButton.setAttribute("onClick", 'openNewModal("ordersModal", "authModal")');
			} else {
				typeButton.setAttribute("onClick", 'openNewModal("ordersModal", "buyMarketModal")');
			}
		}
	} else {
		typeButton.innerHTML = "Sell ...";
		typeButton.id = "marketSellBtn";

		const url = location.href;
		const cleanUrl = url.split('#')[0];
		if (cleanUrl != "http://localhost:3000/unlogged/market.html") {
			typeButton.setAttribute("onClick", `openNewModal("ordersModal", "sellMarketModal")`);
		}
		if (data === null) {
			ordersNumberElement.textContent = "0 for sale, be the fist one!";
			noOrdersElement.classList.remove('d-none');
			tableElement.classList.add('d-none');
			container.appendChild(clone);

			const url = location.href;
			const cleanUrl = url.split('#')[0];
			if (cleanUrl == "http://localhost:3000/unlogged/market.html") {
				typeButton.setAttribute("onClick", 'openNewModal("ordersModal", "authModal")');
			} else {
				typeButton.setAttribute("onClick", `openNewModal("ordersModal", "sellMarketModal")`);
				const button = document.querySelector('#marketSellBtn');
				button.addEventListener('click', function() {
					showSellInfo(heroId, data);
				});
			}
			return;
		}
	}

    let sortedOrders = (type === "buy")
        ? data.orders.sort((a, b) => a.price - b.price)
        : data.orders.sort((a, b) => b.price - a.price);
	//console.log("First",sortedOrders);

	//console.log(sortedOrders);
    ordersNumberElement.textContent = `${data.totalDocuments} for sale starting at ${sortedOrders[0].price} Hp`;

	tbodyElement.innerHTML = "";

	if (data.totalDocuments <= 5) {
        // Mostro solo i risultati disponibili
        sortedOrders.forEach(order => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${order.price} Hp</td><td>${order.quantity}</td>`;
            tbodyElement.appendChild(row);
        });
    } else {
        // Mostro i primi 5 ordini e aggiungo "or more" o "or less" all'ultima riga
        sortedOrders.slice(0, 4).forEach(order => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${order.price} Hp</td><td>${order.quantity}</td>`;
            tbodyElement.appendChild(row);
        });

        // Determino l'etichetta per l'ultimo ordine
        let lastOrder = sortedOrders[4];
        let lastRow = document.createElement('tr');
        let priceLabel = type === "buy" ? `${lastOrder.price} Hp or more` : `${lastOrder.price} Hp or less`;
        lastRow.innerHTML = `<td>${priceLabel}</td><td>${lastOrder.quantity}</td>`;
        tbodyElement.appendChild(lastRow);
    }

	container.appendChild(clone);

	if (type === "buy") {
		const url = location.href;
		const cleanUrl = url.split('#')[0];
		if (cleanUrl == "http://localhost:3000/unlogged/market.html") {
			typeButton.setAttribute("onClick", 'openNewModal("ordersModal", "authModal")'); 
		} else {
			const button = document.querySelector('#marketBuyBtn');
			button.addEventListener('click', function() {
				showBuyInfo(heroId, data);
			});
		}
	} else {
		const url = location.href;
		const cleanUrl = url.split('#')[0];
		if (cleanUrl == "http://localhost:3000/unlogged/market.html") {
			typeButton.setAttribute("onClick", 'openNewModal("ordersModal", "authModal")'); 
		} else {
			const button = document.querySelector('#marketSellBtn');
			button.addEventListener('click', function() {
				showSellInfo(heroId, data);
			});
		}
	}
}

function openNewModal(close, open) {
    let firstModal = bootstrap.Modal.getInstance(document.getElementById(`${close}`));
    firstModal.hide();

    let secondModal = new bootstrap.Modal(document.getElementById(`${open}`));
    secondModal.show();
}

async function getHeroInfo(id) {
	let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${id}`);
	url.searchParams.append('limit', 1);

	const response = await fetch(url.href);
	const characterData = await response.json();
	return characterData.data.results[0];
}

async function showSellInfo(heroId, orders) {
	let heroData = await getHeroInfo(heroId);
	const div = document.getElementById("sellMarketModal");
	div.querySelector("#marketItemModalLabel").innerHTML = `Market Item: ${heroId}`;
	div.querySelector(".figurinaImg").src = `${heroData.thumbnail.path}.${heroData.thumbnail.extension}`;
	div.querySelector(".figurinaName").innerHTML = heroData.name;

	let response = await fetch('http://localhost:3000/cards/getCards', {method: 'POST',	headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"searchParam": "id", "cards": [parseInt(heroId)]})});
	const card = await response.json();
	response = await fetch('http://localhost:3000/collection/getCollection', {method: 'GET', headers: {'Content-Type': 'application/json'},});
	if (response.status === 204) {
		div.querySelector("#itemAvailable").innerHTML = "x0";
		div.querySelector("#quantityInput").setAttribute("max", 0);
		div.querySelector("#quantityInput").setAttribute("min", 0);
		div.querySelector("#quantityInput").setAttribute("value", 0);
		alert("You cannot place an order Collection empty, buy some pack or some cards from market");
		return;
	}
	const coll = await response.json();
	const cardId = card[0].cardId;
	const q = coll[cardId.toString()];

	if (q === undefined) {
		div.querySelector("#itemAvailable").innerHTML = "x0";
		div.querySelector("#quantityInput").setAttribute("max", 0);
		div.querySelector("#quantityInput").setAttribute("min", 0);
		div.querySelector("#quantityInput").setAttribute("value", 0);
	} else {
		div.querySelector("#itemAvailable").innerHTML = `x${q}`;
		div.querySelector("#quantityInput").setAttribute("max", q);
		div.querySelector("#quantityInput").setAttribute("min", 1);
		div.querySelector("#quantityInput").setAttribute("value", 1);

		const button = document.querySelector('#placeOrder');
		const handlePlaceOrderClick = () => {
			let price = document.getElementById("sellMarketModal").querySelector("#priceInput").value;
			let quantity = document.getElementById("sellMarketModal").querySelector("#quantityInput").value;
			placeOrderFunc(price, quantity, cardId);
			button.removeEventListener('click', handlePlaceOrderClick);
			button.removeAttribute('data-event-attached');
		};
		if (!button.hasAttribute('data-event-attached')) {
			button.addEventListener('click', handlePlaceOrderClick);
			button.setAttribute('data-event-attached', 'true');  // Marca l'evento come aggiunto
		}
	}

	if (orders === null) {
		div.querySelector("#priceInput").setAttribute("value", `${card[0].priceInitial}`);
	} else {
        orders = orders.orders.sort((a, b) => b.price - a.price);
		//console.log("Second",orders);
		let advicedPrice = (Math.floor(orders[0].price / 1.07)) + 1;

		div.querySelector("#priceInput").setAttribute("value", advicedPrice);
	}
}

async function placeOrderFunc(price, quantity, cardId) {
	//console.log(price, quantity, cardId);
	let response = await fetch(`http://localhost:3000/orders/placeOrder`, {
		method: 'POST',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({price: parseInt(price), quantity: parseInt(quantity), cardId: parseInt(cardId)}),
	});
	const res = await fetch('http://localhost:3000/cards/getCards', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			"searchParam": "cardId",
			"cards": [cardId]
		})
	});
	const card = await res.json();
	const container = document.getElementById("sellMarketModal");
	if (response.ok) {
		//console.log('Order successfully placed!');
		container.querySelector('.fineAddition').innerHTML = "Order placed successfully!";
		let toastElement = container.querySelector('.saveToastS');
		let toast = new bootstrap.Toast(toastElement);
		toast.show();
		setTimeout(function() {
			showItemMaketInfo(card[0].id);
			openNewModal("sellMarketModal", "ordersModal");
		}, 2000);
		showUserOrders();
	} else {
		if (response.status === 409) {
			let toastElement = container.querySelector('.saveToastW');
			let toast = new bootstrap.Toast(toastElement);
			toastElement.querySelector(".toast-body").innerHTML = "Something went wrong!";
			toast.show();
			setTimeout(function() {
				showItemMaketInfo(card.id);
			}, 4000);
		} else {
			console.error('Error couldn\'t add your order:', response.status, response.statusText);
		}
	}
}


async function showBuyInfo(heroId, orders) {
	document.getElementById("notEnoughHp").classList.add("d-none");
	heroData = await getHeroInfo(heroId);
	let response = await fetch('http://localhost:3000/cards/getCards', {method: 'POST',	headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"searchParam": "id", "cards": [parseInt(heroId)]})});
	const card = await response.json();
	response = await fetch('http://localhost:3000/users/getData', {method: 'GET', headers: {'Content-Type': 'application/json'},});
	const user = await response.json();
	const hp = user.hp;
	const cardId = card[0].cardId;
	orders = orders.orders.sort((a, b) => a.price - b.price);
	const order = orders[0];

	const div = document.getElementById("buyMarketModal");
	div.querySelector("#itemAvailable").innerHTML = `x${user.hp} hp`;
	if (hp < order.price) {
		div.querySelector("#quantityInput").setAttribute("max", 0);
		div.querySelector("#quantityInput").setAttribute("min", 0);
		div.querySelector("#quantityInput").setAttribute("value", 0);
		alert("You cannot affort this! \nBuy some Hp from Shop!");
	} else {
		if (order.quantity >= Math.floor(hp/order.price)) {
			div.querySelector("#quantityInput").setAttribute("max", Math.floor(hp/order.price));
		} else {
			div.querySelector("#quantityInput").setAttribute("max", order.quantity);
		}
		div.querySelector("#quantityInput").setAttribute("min", 1);
		div.querySelector("#quantityInput").setAttribute("value", 1);
		div.querySelector("#totalBuyPrice").innerHTML = `${order.price} Hp`;

		div.querySelector("#quantityInput").addEventListener('input', function(event) {
			const newValue = event.target.value;
			updateTotal(newValue * order.price);
		});

		const button = document.querySelector('#buyItem');
		const handleBuyOrderClick = () => {
			let quantity = document.getElementById("buyMarketModal").querySelector("#quantityInput").value;
			if (quantity >= 0 && quantity <= order.quantity) {
				placeBuyOrderFunc(order);
				button.removeEventListener('click', handleBuyOrderClick);
				button.removeAttribute('data-event-attached');
			} else {
				div.querySelector("#quantityInput").setAttribute("value", 1);
			}
		};
		if (!button.hasAttribute('data-event-attached')) {
			button.addEventListener('click', handleBuyOrderClick);
			button.setAttribute('data-event-attached', 'true');  // Marca l'evento come aggiunto
		}
	}
	div.querySelector("#marketItemModalLabel").innerHTML = `Market Item: ${heroId}`;
	div.querySelector(".figurinaImg").src = `${heroData.thumbnail.path}.${heroData.thumbnail.extension}`;
	div.querySelector(".figurinaName").innerHTML = heroData.name;
}

function updateTotal(value) {
	document.getElementById("totalBuyPrice").innerHTML = `${value} Hp`;
}

async function placeBuyOrderFunc(order) {
	const itemQuantity = document.getElementById("buyMarketModal").querySelector("#quantityInput").value;
	//console.log(order);
	let response = await fetch(`http://localhost:3000/orders/buyOrder`, {
		method: 'PUT',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({itemQuantity: parseInt(itemQuantity), orderId: parseInt(order.orderId)}),
	});
	const res = await fetch('http://localhost:3000/cards/getCards', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			"searchParam": "cardId",
			"cards": [order.cardId]
		})
	});
	const card = await res.json();
	const container = document.getElementById("buyMarketModal");
	if (response.ok) {
		container.querySelector('.fineAddition').innerHTML = "a fine addition to my collection";
		let toastElement = container.querySelector('.saveToastS');
		let toast = new bootstrap.Toast(toastElement);
		toast.show();
		// check x fineAddition
		if (getFromLS("fineAddition") === "true") {
			// Play Fine Audio
			const sound = new Audio('../assets/fineAdditionToMyCollection.wav');
			sound.play();
		}
		setTimeout(function() {
			showItemMaketInfo(card[0].id);
			openNewModal("buyMarketModal", "ordersModal");
		}, 2000);
	} else {
		let toastElement = container.querySelector('.saveToastW');
		let toast = new bootstrap.Toast(toastElement);
		let elem = toastElement.querySelector(".toast-body");
		if (response.status === 403) {
			document.getElementById("notEnoughHp").classList.remove("d-none");
			elem.innerHTML = "Sorry, not enough Hp!";
			toast.show();
			setTimeout(function() {
				showItemMaketInfo(card.id);
			}, 4000);
		} else if (response.status === 409) {
			toast.show();
			setTimeout(function() {
				showItemMaketInfo(card.id);
			}, 4000);
		} else {
			console.error('Error couldn\'t add your order:', response.status, response.statusText);
		}
	}
}

async function showUserOrders() {
	let orders;
	let response = await fetch(`http://localhost:3000/orders/getUserOrders`, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', }, });
	if (response.ok) {
		orders = response.status === 204 ? null : await response.json();
		//console.log(orders);
	} else {
		if (response.status === 404) {
			console.error('Error couldn\'t find your order:', response.status, response.statusText);
			return;
		} else {
			console.error('Error:', response.status, response.statusText);
			return;
		}
	}

	document.getElementById("manageOrdersGenDiv").querySelector(".noOrdersFound").classList.add("d-none");
	if (response.status === 204) {
		document.getElementById("manageOrdersGenDiv").querySelector(".noOrdersFound").classList.remove("d-none");	
		return;
	}

	const ordersContainer = document.getElementById("cardOrdersContainer");

	// clear della board
	const children = Array.from(ordersContainer.children);
	for (let i = 1; i < children.length; i++) {
		const child = children[i];
		if (child.tagName === 'DIV') {
			ordersContainer.removeChild(child);
		}
	}

	orders = orders.orders.sort((a, b) => a.price - b.price);

	for (let i=0; i < orders.length; i++) {
		let order = orders[i];
		const template = ordersContainer.querySelector("template");
		let clone = template.content.cloneNode(true);

		let img = clone.querySelector('.orderImage');
		let name = clone.querySelector('.orderName');
		let price = clone.querySelector('.orderPrice');
		let quantity = clone.querySelector('.orderQuantity');
		let id = clone.querySelector('.orderId');

		price.innerHTML = `${order.price} Hp`;
		quantity.innerHTML = `x${order.quantity}`;
		id.innerHTML = order.orderId;

		// get hero marvel Id
		let characterId;
		const res = await fetch('http://localhost:3000/cards/getCards', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				"searchParam": "cardId",
				"cards": [order.cardId]
			})
		});
		if (res.ok) {
			const card = await res.json();
			characterId = card[0].id;
		} else {
			console.error('Error:', res.status, res.statusText);
			return;
		}

		// get hero details
		let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${/*MODIFY ME*/characterId}`);
		url.searchParams.append('limit', 1);

		const response = await fetch(url.href);
		const characterData = await response.json();

		name.innerHTML = characterData.data.results[0].name;
		img.src = `${characterData.data.results[0].thumbnail.path}.${characterData.data.results[0].thumbnail.extension}`;

		const cardElem = clone.querySelector('.deleteMe');
		const button = clone.querySelector('.btn-close');
		button.addEventListener('click', function() {
			deleteOrder(order.orderId);
			cardElem.remove();	
		});

		ordersContainer.appendChild(clone);
	}
}

async function deleteOrder(orderId) {
	const res = await fetch('http://localhost:3000/orders/deleteOrder', {
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			"orderId": orderId
		})
	});
	if (!res.ok) {
		console.error('Error:', res.status, res.statusText);
		return;
	}
}

function fineAddition(x) {
	saveToLS('fineAddition', x);
} 
