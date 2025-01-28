// Display radio section

document.addEventListener('DOMContentLoaded', function () {
	saveToLS("searchText", "");
	const radioCollection = document.getElementById('btnradio1');
	const radioOpenPacks = document.getElementById('btnradio2');
	const openPacksDiv = document.getElementById('openPacksGenDiv');
	const collectionDiv = document.getElementById('collectionGenDiv');

	const openPacksCard = openPacksDiv.querySelector('.cascade-item-openpacks');
	const collectionCard = collectionDiv.querySelector('.cascade-item-collection');
	displayPacksQuantity();
	showCollection();
	// Show Open Packs initially
    openPacksDiv.style.display = 'block';
    collectionDiv.style.display = 'none';

	function resetAnimation() {
		// Rimuovo le classi di animazione per poterle riapplicare
		openPacksCard.classList.remove('cascade-show-openpacks');
		collectionCard.classList.remove('cascade-show-collection');
	}

	// Al caricamento della pagina, mostra la card di Open Packs
	setTimeout(() => {
		openPacksCard.classList.add('cascade-show-openpacks'); // Cambiato per l'animazione di "Open Packs"
	}, 100);  // Ritardo per fluidità al caricamento

	radioCollection.addEventListener('change', function () {
		if (radioCollection.checked) {
			openPacksDiv.style.display = 'none';
			collectionDiv.style.display = 'block';

			// Resetta l'animazione per entrambe le sezioni
			resetAnimation();

			// Mostra l'animazione della card di Collection
			setTimeout(() => {
				collectionCard.classList.add('cascade-show-collection');
			}, 100);  // Ritardo per fluidità
		}
	});

	radioOpenPacks.addEventListener('change', function () {
		if (radioOpenPacks.checked) {
			collectionDiv.style.display = 'none';
			openPacksDiv.style.display = 'block';

			// Resetta l'animazione per entrambe le sezioni
			resetAnimation();

			// Mostra l'animazione della card di Open Packs
			setTimeout(() => {
				openPacksCard.classList.add('cascade-show-openpacks');
			}, 100);  // Ritardo per fluidità
		}
	});
});

// ANIMATIONS HANDLER
let typeInfo = null;
let containerAnim = null;
let idleImage = null;
let glowImage = null;
let openImage = null;
let glowAnimation = null;
let deglowAnimation = null;
let shakeAnimation = null;
let openAnimation = null;

let clickTimeout = null; // Per distinguere tra singolo click e doppio click
let currentAnimation = null;

// Funzione per fermare l'animazione corrente
function stopCurrentAnimation() {
    if (currentAnimation) {
		if (currentAnimation !== openAnimation) {
			currentAnimation.pause();
			currentAnimation.currentTime = 0;
			currentAnimation.classList.add('invisible');
			currentAnimation = null;
		}
    }
}

// Funzione per riprodurre l'animazione di glow
function playGlowAnimation() {
    //console.log("!Glow!");
    stopCurrentAnimation();
    idleImage.classList.add('invisible');  // Nascondi immagine idle
    glowAnimation.classList.remove('invisible');  // Mostra video animazione glow
    currentAnimation = glowAnimation;
    glowAnimation.play();

    glowAnimation.onended = function() {
    };
}

// Funzione per riprodurre l'animazione di deglow
function playDeGlowAnimation() {
    //console.log("!DeGlow!");
    stopCurrentAnimation();
    deglowAnimation.classList.remove('invisible');  // Mostra video animazione deglow
    currentAnimation = deglowAnimation;
    deglowAnimation.play();

    deglowAnimation.onended = function() {
        deglowAnimation.classList.add('invisible');  // Nascondi video animazione deglow
        idleImage.classList.remove('invisible');  // Mostra immagine glow statica
    };
}

// Funzione per riprodurre l'animazione di shake
function playShakeAnimation() {
    //console.log("!Shake!");
    stopCurrentAnimation();
    idleImage.classList.add('invisible');  // Nascondi immagine idle
    shakeAnimation.classList.remove('invisible');  // Mostra video animazione shake
    currentAnimation = shakeAnimation;
    shakeAnimation.play();

    shakeAnimation.onended = function() {
    };
}

// Funzione per riprodurre l'animazione di open
function playOpenAnimation() {
    //console.log("!Open!");
	const containerAnim = document.querySelector(`#animationsContainer${typeInfo}`);

	//Rimuovi gli event listener
	containerAnim.removeEventListener('mouseenter', playGlowAnimation);
	containerAnim.removeEventListener('mouseleave', playDeGlowAnimation);
	containerAnim.removeEventListener('click', handleClick);
	containerAnim.removeEventListener('dblclick', handleDbClick);

    stopCurrentAnimation();
    idleImage.classList.add('invisible');  // Nascondi immagine idle
    openAnimation.classList.remove('invisible');  // Mostra video animazione open
    currentAnimation = openAnimation;
    openAnimation.play();

    openAnimation.onended = function() {
    };
}

function handleClick() {
    if (clickTimeout) {
        clearTimeout(clickTimeout);
    }
    
    // Imposta un timeout per gestire il click singolo
    clickTimeout = setTimeout(() => {
		playShakeAnimation();
        clickTimeout = null;  // Resetta il timeout dopo l'esecuzione
    }, 200);  // Tempo breve per distinguere tra clic singolo e doppio clic
}

function handleDbClick() {
    if (clickTimeout) {
        clearTimeout(clickTimeout);  // Annulla il singolo click se è un doppio click
    }
	spacchettamentoSelvaggio(document.querySelector("#openx1Pack").getAttribute('data-param'));
}

// Funzione per simulare l'apertura del pack
async function spacchettamentoSelvaggio(type) {
	const [exist, cookieValue] = checkCookieExists('token');
	const userId = cookieValue.split("!")[1];

	if (exist) {
		let response = await fetch(`http://localhost:3000/users/spacchettamento`, {
			method: 'POST',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({type: type}),
		});
		if (response.ok) {
			playOpenAnimation();
			const results = await response.json();
			setTimeout(() => {
				showCollection();
				displayPackContent(results);
			}, 3000);
			//console.table(results)
		} else if (response.status === 403) {
			document.querySelector('#modalPackLabel').innerHTML = `Not enough ${type} packs`;
			setTimeout(() => {
				document.querySelector('#modalPackLabel').innerHTML = ``;
			}, 2000);
		} else {
			console.error('Error:', response.status, response.statusText);
		}
		displayPacksQuantity();
	}
}

function displayPackContent(cards) {
	document.getElementById("openx1Pack").classList.add("d-none");
	document.getElementById("okBtn").classList.remove("d-none");
	document.getElementById("divNoName1").classList.remove("d-none");

    let container = document.getElementById('containerHero');
    let cardTemplate = container.querySelector('template');

	const children = Array.from(container.children);
	for (let i = 1; i < children.length; i++) {
		const child = children[i];
		if (child.tagName === 'DIV') {
			container.removeChild(child);
		}
	}
	
	cards.cards.forEach(card => {
		let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${card.id}`);
		url.searchParams.append('limit', 1);

		fetch(url.href)
			.then(response => response.json())
			.then(characterData => {
				let character = characterData.data.results[0];
				let clone = cardTemplate.content.cloneNode(true);
				let container2 = clone.querySelector('div');
				container2.id = 'cardCharacter-' + character.id;

				let button = clone.querySelector('a');
				let nome = clone.querySelector('p');
				let image = clone.querySelector('img');
				let borderImg = clone.querySelector('.borderImg');
				let borderP = clone.querySelector('.borderP');

				borderImg.classList.remove(`borderImg`);
				borderImg.classList.add(`borderImg${card.rarity}`);
				borderP.classList.remove(`borderP`);
				borderP.classList.add(`borderP${card.rarity}`);

				nome.innerHTML = character.name;
				image.src = `${character.thumbnail.path}.${character.thumbnail.extension}`
				button.href = "details.html?id=" + character.id;

				container.appendChild(clone);
			})
			.catch(error => {
				console.error(`Error:`, error);
			});
	});
}

// Event listener per quando chiudi il modal dopo aver aperto packs
const closeButton = document.getElementById('openPackModalCloseBtn');
closeButton.addEventListener('click', function() {
	containerAnim.classList.add("d-none");
	returnToPackOpening();
});

function returnToPackOpening() {
	const containerAnim = document.querySelector(`#animationsContainer${typeInfo}`);
	document.getElementById("openx1Pack").classList.remove("d-none");
	document.getElementById("okBtn").classList.add("d-none");
	document.getElementById("divNoName1").classList.add("d-none");
	containerAnim.querySelector("#openAnimation").classList.add("invisible");
	containerAnim.querySelector("#idleImage").classList.remove("invisible");

	// Risetto gli event listener
	containerAnim.addEventListener('mouseenter', playGlowAnimation);
	containerAnim.addEventListener('mouseleave', playDeGlowAnimation);
	containerAnim.addEventListener('click', handleClick);
	containerAnim.addEventListener('dblclick', handleDbClick);
}

// Display quantità Packs
async function displayPacksQuantity() {
	const [exist, cookieValue] = checkCookieExists('token');

	if (exist) {
		let response = await fetch(`http://localhost:3000/users/packsQuantity`, {
			method: 'GET',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
		});
		if (response.ok) {
			const results = await response.json();
			const h3s = document.getElementById("openPacksGenDiv").querySelectorAll("h3");
			h3s.forEach(function(h3, i) {
				switch (i) {
					case 0:
						h3.textContent = "x" + results.common;
					break;
					case 1:
						h3.textContent = "x" + results.epic;
					break;
					case 2:
						h3.textContent = "x" + results.legendary;
					break;
				} 
			});			
		} else {
			console.error('Error:', response.status, response.statusText);
		}
	} else {
		console.log('Token not found!.');
	}
}

// Before open del modal update il bottone x open packs
document.querySelectorAll('.buttonDiv').forEach(function(button) {
	//console.log(button)
    button.addEventListener('click', function() {
        var dataParam = this.getAttribute('data-param');
        var modal = document.getElementById('openPacksModal');
		var modalButton = modal.querySelector('#openx1Pack');
		modalButton.setAttribute('data-param', `${dataParam}`);
		modalButton.setAttribute('onclick', `spacchettamentoSelvaggio('${dataParam}')`);
		document.querySelector('#modalPackLabel').innerHTML = "";
		typeInfo = dataParam;
		containerAnim = document.querySelector(`#animationsContainer${typeInfo}`);
		containerAnim.classList.remove("d-none");
		idleImage = containerAnim.querySelector('#idleImage');
		glowAnimation = containerAnim.querySelector('#glowAnimation');
		deglowAnimation = containerAnim.querySelector('#deglowAnimation');
		shakeAnimation = containerAnim.querySelector('#shakeAnimation');
		openAnimation = containerAnim.querySelector('#openAnimation');

		// Aggiungo event listener
		containerAnim.addEventListener('mouseenter', playGlowAnimation);
		containerAnim.addEventListener('mouseleave', playDeGlowAnimation);
		containerAnim.addEventListener('click', handleClick);
		containerAnim.addEventListener('dblclick', handleDbClick);
	});
});


// COLLECTION SECTION
let allHeroes;

async function getCollection() {
	let response = await fetch(`http://localhost:3000/collection/getCollection`, {
		method: 'GET',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
	});
	if (response.ok) {
		if (response.status === 204) {
			return  null;
		}
		return collectionData = await response.json();
	} else {
		console.error('Error:', response.status, response.statusText);
		return null;
	}
}

async function getCards(cards, searchParam) {
	let response = await fetch(`http://localhost:3000/cards/getCards`, {
		method: 'POST',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({cards: cards, searchParam: searchParam}),
	});
	if (response.ok) {
		return cards = await response.json();
	} else {
		console.error('Error:', response.status, response.statusText);
		return null;
	}
}

function getDiff(coll, marvel) {
    const have = [];
    const notHave = [];

    // Creo un set con tutti i cardId del primo array per velocizzare il confronto
    const cardIdscoll = new Set(coll.map(obj => obj.cardId));

    // Trovo oggetti comuni (presenti sia in coll che in marvel) e oggetti esclusivi di marvel
    marvel.forEach(obj => {
        if (cardIdscoll.has(obj.cardId)) {
            have.push(obj);
        } else {
            notHave.push(obj);
        }
    });
	//console.log("have:" + have);
	//console.log("notHave:" + notHave);

    return { have, notHave };
}

async function showCollection() {
    const collection = await getCollection();

	if (document.getElementById('warnSign')) {
		document.getElementById('warnSign').innerHTML = "";
	}

	if (collection === null) {
		let cont = document.getElementById('pageNavDiv');
		var newDiv = document.createElement("div");
		var newP = document.createElement("p");
		newDiv.id = "warnSign";
		newP.textContent = "Your colletion is empty, open some Packs!";
		newP.className = "text-warning";

		newDiv.appendChild(newP);
		cont.insertAdjacentElement("afterend",newDiv);
		return;
	}

    let keys = Object.keys(collection).map(key => Number(key));
    const cards = await getCards(keys, "cardId");
    let have = null;
    let notHave = null;

    if (isValidString(getFromLS("searchText"))) {
        let result = [];
        let totalCharacters = Infinity;
        let offset = 0;
        while (offset < totalCharacters) {
            let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters`);
            url.searchParams.append('limit', 20);
            url.searchParams.append('offset', offset);
            url.searchParams.append('nameStartsWith', getFromLS("searchText"));
            const res = await fetch(url.href);
            const characterData = await res.json();
            totalCharacters = characterData.data.total;
            for (let i = 0; i < characterData.data.results.length; i++) {
                result.push(characterData.data.results[i].id);
            }
            offset += 20;
        }
        const marvel = await getCards(result, "id");
        ({ have, notHave } = getDiff(cards, marvel));
        const characterData = [];

        // Fetch character data for items in the "have" list
        for (let i = 0; i < have.length; i++) {
            let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${have[i].id}`);
            const response = await fetch(url.href);
            const res = await response.json();

            for (let y = 0; y < res.data.results.length; y++) {
                characterData.push({
                    id: res.data.results[y].id,
                    name: res.data.results[y].name,
                    thumbnail: {
                        path: res.data.results[y].thumbnail.path,
                        extension: res.data.results[y].thumbnail.extension
                    }
                });
            }
        }

        let container = document.getElementById('containerHero2');
        let cardTemplate = container.querySelector('#cardHero');

		const children = Array.from(container.children);
		for (let i = 1; i < children.length; i++) {
			const child = children[i];
			if (child.tagName === 'DIV') {
				container.removeChild(child);
			}
		}

        // Aggiungo solo i nuovi elementi che non sono già presenti
        for (let i = 0; i < characterData.length; i++) {
            const character = characterData[i];
            const existingCharacter = container.querySelector(`#cardCharacter-${character.id}`);
            
            if (!existingCharacter) { // Check if character esiste già
                let clone = cardTemplate.content.cloneNode(true);
                let container2 = clone.querySelector('div');
                container2.id = 'cardCharacter-' + character.id;

                let button = clone.querySelector('a');
                let nome = clone.querySelector('p');
                let image = clone.querySelector('img');

				let borderImg = clone.querySelector('.borderImg1');
				let borderP = clone.querySelector('.borderP1');
				const char = cards.find(card => card.id === character.id);
				const rarity = char.rarity;
				const quantity = collection[char.cardId];
				switch (rarity) {
					case "common":
						borderImg.classList.add("borderImgcommon");
						borderP.classList.add("borderPcommon");
					break;
					case "rare":
						borderImg.classList.add("borderImgrare");
						borderP.classList.add("borderPrare");
					break;
					case "epic":
						borderImg.classList.add("borderImgepic");
						borderP.classList.add("borderPepic");
					break;
					case "legendary":
						borderImg.classList.add("borderImglegendary");
						borderP.classList.add("borderPlegendary");
					break;
				}

                nome.innerHTML = `${character.name}<br>x${quantity}`;
				nome.style.height = "70px";
                image.src = `${character.thumbnail.path}.${character.thumbnail.extension}`
                button.href = "details.html?id=" + character.id;

                container.appendChild(clone);
            }
        }

        // Section notHave
        for (let i = 0; i < notHave.length; i++) {
            let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${notHave[i].id}`);
            const response = await fetch(url.href);
            const res = await response.json();

            for (let y = 0; y < res.data.results.length; y++) {
                const character = {
                    id: res.data.results[y].id,
                    name: res.data.results[y].name,
                    thumbnail: {
                        path: res.data.results[y].thumbnail.path,
                        extension: res.data.results[y].thumbnail.extension
                    }
                };

                const existingCharacter = container.querySelector(`#cardCharacter-${character.id}`);
                
                if (!existingCharacter) { // Check if character esiste già
                    let clone = cardTemplate.content.cloneNode(true);
                    let container2 = clone.querySelector('div');
                    container2.id = 'cardCharacter-' + character.id;

                    let button = clone.querySelector('a');
                    let nome = clone.querySelector('p');
                    let image = clone.querySelector('img');

					let borderImg = clone.querySelector('.borderImg1');
					let borderP = clone.querySelector('.borderP1');
					const rarity = cards.find(card => card.id === character.id)?.rarity;
					switch (rarity) {
						case "common":
							borderImg.classList.add("borderImgcommon");
							borderP.classList.add("borderPcommon");
						break;
						case "rare":
							borderImg.classList.add("borderImgrare");
							borderP.classList.add("borderPrare");
						break;
						case "epic":
							borderImg.classList.add("borderImgepic");
							borderP.classList.add("borderPepic");
						break;
						case "legendary":
							borderImg.classList.add("borderImglegendary");
							borderP.cclassList.add("borderPlegendary");
						break;
					}

					nome.innerHTML = `${character.name}<br>x0`;
					nome.style.height = "70px";
                    image.src = `${character.thumbnail.path}.${character.thumbnail.extension}`
                    image.classList.add("imgBW");
                    button.href = "details.html?id=" + character.id;

                    container.appendChild(clone);
                }
            }
        }

		if (characterData.length === 0) {
			let clone = cardTemplate.content.cloneNode(true);
			let container2 = clone.querySelector('div');
			container2.id = 'cardCharacter-' + "nullCharacter";

			let nome = clone.querySelector('p');
			let image = clone.querySelector('img');
			nome.innerHTML = "No heroes found in  collection!";
			nome.classList.remove("text-truncate");
			image.src = "../assets/imageNotFound.png";

			container.appendChild(clone);
		}
    } else {
        // Section no search
        const characterData = [];
        for (let i = 0; i < cards.length; i++) {
            let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${cards[i].id}`);
            const response = await fetch(url.href);
            const res = await response.json();

            for (let y = 0; y < res.data.results.length; y++) {
                characterData.push({
                    id: res.data.results[y].id,
                    name: res.data.results[y].name,
                    thumbnail: {
                        path: res.data.results[y].thumbnail.path,
                        extension: res.data.results[y].thumbnail.extension
                    }
                });
            }
        }

        let container = document.getElementById('containerHero2');
        let cardTemplate = container.querySelector('#cardHero');

		const children = Array.from(container.children);
		for (let i = 1; i < children.length; i++) {
			const child = children[i];
			if (child.tagName === 'DIV') {
				container.removeChild(child);
			}
		}

        // Aggiungo solo i nuovi elementi che non sono già presenti
        for (let i = 0; i < characterData.length; i++) {
            const character = characterData[i];
            const existingCharacter = container.querySelector(`#cardCharacter-${character.id}`);

            if (!existingCharacter) {
                let clone = cardTemplate.content.cloneNode(true);
                let container2 = clone.querySelector('div');
                container2.id = 'cardCharacter-' + character.id;

                let button = clone.querySelector('a');
                let nome = clone.querySelector('p');
                let image = clone.querySelector('img');

				let borderImg = clone.querySelector('.borderImg1');
				let borderP = clone.querySelector('.borderP1');
				const char = cards.find(card => card.id === character.id);
				const rarity = char.rarity;
				const quantity = collection[char.cardId];
				switch (rarity) {
					case "common":
						borderImg.classList.add("borderImgcommon");
						borderP.classList.add("borderPcommon");
					break;
					case "rare":
						borderImg.classList.add("borderImgrare");
						borderP.classList.add("borderPrare");
					break;
					case "epic":
						borderImg.classList.add("borderImgepic");
						borderP.classList.add("borderPepic");
					break;
					case "legendary":
						borderImg.classList.add("borderImglegendary");
						borderP.classList.add("borderPlegendary");
					break;
				}

                nome.innerHTML = `${character.name}<br>x${quantity}`;
				nome.style.height = "70px";
                image.src = `${character.thumbnail.path}.${character.thumbnail.extension}`
                button.href = "details.html?id=" + character.id;

                container.appendChild(clone);
            }
        }
		if (characterData.length === 0) {
			let clone = cardTemplate.content.cloneNode(true);
			let container2 = clone.querySelector('div');
			container2.id = 'cardCharacter-' + "nullCharacter";

			let nome = clone.querySelector('p');
			let image = clone.querySelector('img');
			nome.innerHTML = "No heroes in collection!";
			nome.classList.remove("text-truncate");
			image.src = "../assets/imageNotFound.png";

			container.appendChild(clone);
		}
    }
}

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
			showCollection(page*20);
        }
    } else if (action === 1) {
        // Next
        if ((page+1)*20 < totalCharacters) {
            page++;
			prevElement.classList.remove("disabled");
            saveToLS('pageNumber', page);
			changePage(2);
			showCollection(page*20)
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
	showCollection(0);
}

const searchBar = document.getElementById('searchBar');
searchBar.addEventListener('input', function() {
	const query = searchBar.value;
	if (query.length > 2) {
		saveToLS("searchText", query);
		searchFromBar();
	} else if (query.length === 0) {
		saveToLS("searchText", "");
		searchFromBar();
	}
});
