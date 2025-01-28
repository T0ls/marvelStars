document.addEventListener("DOMContentLoaded", function () {
	saveToLS("searchText", "");
    const input = document.getElementById('favoredHero');
    const autocompleteList = document.getElementById('autocomplete-list');
    
    async function fetchMarvelHeroes(query) {
		let url = getAuthedURL('https://gateway.marvel.com/v1/public/characters');
		url.searchParams.append('limit', 20);
		url.searchParams.append('nameStartsWith', query);
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.data.results; // Array Eroi
        } catch (error) {
            console.error("An error occurred during data extraction:", error);
            return [];
        }
    }

    // Funzione per autocompletamento
    async function showAutocomplete(query) {
        const heroes = await fetchMarvelHeroes(query);
		console.log(heroes)
        autocompleteList.innerHTML = ''; // Resetto la lista

        // Aggiungo ogni eroe alla lista
        heroes.forEach(hero => {
            const item = document.createElement('button');
            item.className = 'dropdown-item';
            item.innerText = hero.name;
            
            // Aggiungo evento click per inserire il nome nel campo input
            item.addEventListener('click', function () {
                input.value = hero.name;
                autocompleteList.innerHTML = ''; // Nascondo la lista dopo la selezione
            });
            
            autocompleteList.appendChild(item);
        });

        if (heroes.length > 0) {
            autocompleteList.classList.add('show'); // Mostro il dropdown
        } else {
            autocompleteList.classList.remove('show'); // Nascondo il dropdown        
		}
    }

    // Evento per mostrare i suggerimenti
	input.addEventListener('input', function () {
        const query = this.value.trim();
        
        if (query.length > 2) {
            showAutocomplete(query);
        } else {
            autocompleteList.innerHTML = '';
            autocompleteList.classList.remove('show');
        }
    });

    // Chiudo il dropdown se si clicca fuori
    document.addEventListener('click', function (e) {
        if (!autocompleteList.contains(e.target) && e.target !== input) {
            autocompleteList.innerHTML = '';
            autocompleteList.classList.remove('show');
        }
    });
});

async function updateProfile() {
	let email = document.getElementById("email").value;
	let confEmail = document.getElementById("confirmEmail").value;
	let pass = document.getElementById("password").value;
	let confPass = document.getElementById("confirmPassword").value;
	const name = document.getElementById("name").value;
	const surname = document.getElementById("surname").value;
	let username = document.getElementById("username").value;
	const favHero = document.getElementById("favoredHero").value;

	let updateData = {};
	let mod = 0; 
	// Controlli
	if (email !== "" && confEmail !== "") {
		if (email === confEmail) {
			email = email.toLowerCase();
			updateData.email = email;
			mod++;
		} else {
			console.error("Error: Emails are different");
			alert("Emails are not equals!");
			return;
		}
	}
	if (pass !== "" && confPass !== "") {
		// Hash password
		if (pass === confPass) {
			let response = await fetch(`http://localhost:3000/hash`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json',	}, body: JSON.stringify({password: pass}), });
			if (response.ok) {
				updateData.password = await response.json();
				mod++;
			}
		} else {
			console.error("Error: Password are different");
			alert("Pawword are not equals!");
			return;
		}
	}
	if (name !== "") {
		updateData.name = name;
		mod++;
	}
	if (surname !== "") {
		updateData.surname = surname;
		mod++;
	}
	if (username !== "") {
		updateData.username = username;
		mod++;
	}
	if (favHero !== "" && favHero.length > 2) {
		let url = getAuthedURL('https://gateway.marvel.com/v1/public/characters');
		url.searchParams.append('limit', 1);
		url.searchParams.append('nameStartsWith', favHero);

		const response = await fetch(url);
		const data = await response.json();
		const heroId = data.data.results[0].id;

		updateData.favoredHeroId = parseInt(heroId);
		mod++;
	}

	const [exist, _] = checkCookieExists("token");
	if (exist &&  mod !== 0) {
		let response = await fetch(`http://localhost:3000/users/editProfile`, {
			method: 'PUT',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updateData),
		});
		if (response.ok) {
			console.log('Users compleated login successfully!');
				var toastElement = document.getElementById('saveToastS');
				var toast = new bootstrap.Toast(toastElement);
				toast.show();
			setTimeout(function() {
				window.location.href = '/logged/account.html';
			}, 2000);
		} else {
			if (response.status === 409) {
				var toastElement = document.getElementById('saveToastW');
				var toast = new bootstrap.Toast(toastElement);
				toast.show();
				setTimeout(function() {
					toast.hide();
				}, 4000);
			} else {
				console.error('Error:', response.status, response.statusText);
				window.location.href = '/logged/account.html';
			}
		}
	} else {
		//window.location.href = '/unlogged/homePage.html';
	}
}


