// Get UserId
function getUserId(){
    query = window.location.search;
    param = new URLSearchParams(query);
	return  param.get('userId');
}

// Verifica Token
document.addEventListener('DOMContentLoaded', async function() {
	await checkIfLogged();
});

function checkCookieExists(cookieName) {
    const cookies = document.cookie;

    for (let cookie of cookies.split(';')) {
        let trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith(cookieName + '=')) {
            const value = trimmedCookie.split('=')[1];
            return  [true, value];
        }
    }

    return [false, null];
}

async function checkIfLogged() {
	const [exist, _] = checkCookieExists("token");
	if (exist) {
		let response = await fetch(`http://localhost:3000/users/checkLogged`, {
			method: 'GET',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
		});
		if (response.ok) {
			await setProfileImg();
			//console.log('Users compleated login successfully!');
		} else {
			console.error('Error user cannot get authenticated:', response.status, response.statusText);
			window.location.href = '/unlogged/homePage.html';
		}
	} else {
		window.location.href = '/unlogged/homePage.html';
	}
}

// Logout sequence
async function logoutSequence() {
	const [exist, _] = checkCookieExists("token");
	if (exist) {
		let response = await fetch(`http://localhost:3000/users/logout`, {
			method: 'GET',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
		});
		if (response.ok) {
			console.log('Logged users successfully logged out!');
			window.location.href = '/unlogged/homePage.html';
		} else {
			console.error('Error couldn\'t logout logged user:', response.status, response.statusText);
		}
	} else {
		console.log('Token not found!.');
		window.location.href = '/unlogged/homePage.html';
	}
}

// SHOP
async function buy(values) {
	//console.log(values);
	const [exist, cookieValue] = checkCookieExists('token');
	const userId = cookieValue.split("!")[1];
	const x = values.split(";");

	if (exist) {
		if (x[1] === "Hero Points") {
			// Close dei modali 
			const modalDollar = document.getElementById('modalPaymentDollar');
			if (modalDollar.classList.contains('show')) {
				let modalInstanceDollar = bootstrap.Modal.getInstance(modalDollar);
				modalInstanceDollar.hide();
			}
			// Effettivo aggiornamento dei dati nel DB
			sendBuyRequest(values);
		} else {
			// Effettivo aggiornamento dei dati nel DB
			sendBuyRequest(values);
		}
	} else {
		window.location.href = '/unlogged/homePage.html';
	}
}

async function sendBuyRequest(values) {
	const [exist, cookieValue] = checkCookieExists('token');
	if (exist) {
		const userId = cookieValue.split("!")[1];
		const x = values.split(";");

		if (x[1] === "Hero Points") {
			let response = await fetch(`http://localhost:3000/buy/hp`, {
				method: 'PUT',
				headers: { 
					'Accept': 'application/json', 
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({quantity: x[2].replace(/\D/g, '')}),
			});
			if (response.ok) {
				//console.log('Hp successfully added to your account!');
			} else {
				console.error('Error couldn\'t add your Hp to your account:', response.status, response.statusText);
			}
		} else {
			let type;
			if (x[1].includes("Legendary")) {
				type = "legendary";
			} else if (x[1].includes("Epic")) {
				type = "epic";
			} else if (x[1].includes("Normal")) {
				type = "common";
			}
			let response = await fetch(`http://localhost:3000/buy/packs`, {
				method: 'PUT',
				headers: { 
					'Accept': 'application/json', 
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({quantity: x[2].replace(/\D/g, ''), removeHp: x[0], type: type}),
			});

			const modalHp = document.getElementById('modalPaymentHp');
			if (response.ok) {
				//console.log('Pack successfully added to your account!');
				// Close dei modali 
				if (modalHp.classList.contains('show')) {
					//console.log("HERE")
					let modalInstanceHp = bootstrap.Modal.getInstance(modalHp);
					modalInstanceHp.hide();
				}
				// Effettivo aggiornamento dei dati nel DB
			} else {
				if (response.status === 403) {
					console.error('Error: Not enough Hp:', response.message);
					modalHp.querySelector("#exampleModalLabel").textContent =  modalHp.querySelector("#exampleModalLabel").textContent + "Not enogh HP";
				}
				console.error('Error couldn\'t add your pack to your account:', response.status, response.statusText);
			}
		}
	} else {
		window.location.href = '/unlogged/homePage.html';
	}
}

async function setProfileImg() {
	const [exist, _] = checkCookieExists("token");
	if (exist) {
		let response = await fetch(`http://localhost:3000/users/getData`, {
			method: 'GET',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
		});
		if (response.ok) {
			const results = await response.json();
			if (results.favoredHero !== null) {
				let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${results.favoredHero}`);
				url.searchParams.append('limit', 1);
				const res = await fetch(url.href);
				const heroData = await res.json();
				document.getElementById("profileDropdownImg").src = heroData.data.results[0].thumbnail.path + "." + heroData.data.results[0].thumbnail.extension;
			}
		} else {
			console.error('Error:', response.status, response.statusText);
		}
	} else {
		window.location.href = '/unlogged/homePage.html';
	}
}

// MARKET
async function showMarket(offset) {
	let url = getAuthedURL('https://gateway.marvel.com/v1/public/characters');
	url.searchParams.append('limit', 20);
	url.searchParams.append('offset', offset);

	if (isValidString(getFromLS("searchText"))) {
		url.searchParams.append('nameStartsWith', getFromLS("searchText"));
	}

	const response = await fetch(url.href);
	const characterData = await response.json();

    let container = document.getElementById('containerHero');
    let cardTemplate = document.getElementById('cardHero');

	const children = Array.from(container.children);
	for (let i = 1; i < children.length; i++) {
		const child = children[i];
		if (child.tagName === 'DIV') {
			container.removeChild(child);
		}
	}
	
    for (let i = 0; i < characterData.data.results.length; i++) {
        let character = characterData.data.results[i];
		let clone = cardTemplate.content.cloneNode(true);
        let container2 = clone.querySelector('div');
		container2.id = 'cardCharacter-' + character.id;

		let button = clone.querySelector('a');
		let nome = clone.querySelector('p');
		let image = clone.querySelector('img');

		nome.innerHTML = character.name;
		image.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
		button.setAttribute("onClick", `showItemMaketInfo(${character.id})`);

		container.appendChild(clone);
    }

	if (characterData.data.results.length === 0) {
		let clone = cardTemplate.content.cloneNode(true);
        let container2 = clone.querySelector('div');
		container2.id = 'cardCharacter-' + "nullCharacter";

		let nome = clone.querySelector('p');
		let image = clone.querySelector('img');
		nome.innerHTML = "No heroes found!";
		image.src = "../assets/imageNotFound.png";

		container.appendChild(clone);
	}
}
