async function checkSignIn(email) {
	email = email.toLowerCase();
	let response = await fetch(`http://localhost:3000/users/checkEmail/${email}`, {
		method: 'GET',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
	});
	if (response.ok) {
		//const result = await response.json();
		//console.log('User exists:', result);
		document.getElementById("signInEmailButton").classList.remove("d-block");
		document.getElementById("signInEmailButton").classList.add("d-none");

		document.getElementById("loginPasswordForm").classList.remove("d-none");
		document.getElementById("loginPasswordForm").classList.add("d-block");
		document.getElementById("authModalLabel").innerHTML = "Login";
	} else {
		console.error('Search failed, user does not exist:', response.status, response.statusText, "\nRedirecting to registration section");
		document.getElementById("signInEmailButton").classList.remove("d-block");
		document.getElementById("signInEmailButton").classList.add("d-none");

		document.getElementById("registrFormsDiv").classList.remove("d-none");
		document.getElementById("registrFormsDiv").classList.add("d-block");
		document.getElementById("authModalLabel").innerHTML = "Registration";
	}
}

async function loginFunction(email, password) {
	email = email.toLowerCase();
	let response = await fetch(`http://localhost:3000/users/login`, {
		method: 'POST',
		credentials: "include",
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email: email, password: password}),
	});
	if (response.ok) {
		const result = await response.json();
		window.location.replace(`/logged/homepage.html`);
		//console.log('User exists:', result.id);
	} else {
		if (response.status === 401) {
			alert("Wrong password");
		} else if (response.status === 404) {
			alert("Email not found");
			location.reload();
		}
		console.error('Search failed, worng password:', response.status, response.statusText);
	}
}

async function registrFunction(email, password, name, surname, username) {
	email = email.toLowerCase();
	let response = await fetch(`http://localhost:3000/users/registr`, {
		method: 'POST',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email: email, password: password, name: name, surname: surname, username: username}),
	});
	if (response.ok) {
		const result = await response.json();
		console.log('User created Successfully:', result);
		await loginFunction(email, password);
	} else {
		if (response.status === 409) {
			alert("User with that email already exist!");
		}
		console.error('Registration failed:', response.status, response.statusText);
	}
}

// Login part
function handleSubmit(event) {
	event.preventDefault(); // Previene l'invio del form
	const email = document.getElementById('loginEmail').value;
	if (email !== "") {
		checkSignIn(email);
	}
}

async function loginSequence() {
	event.preventDefault(); // Previene l'invio del form
	const email = document.getElementById('loginEmail').value;
	const password = document.getElementById('loginPassword').value;
	if (email !== "") {
		if (password !== "") {
			let response = await fetch(`http://localhost:3000/hash`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json',	}, body: JSON.stringify({password: password}), });
			if (response.ok) {
				const hashedPass = await response.json();
				loginFunction(email, hashedPass);
			} else {
				console.error("Hash error!")
			}
		} else {
			alert("Password field is empty!");
		}
	} else {
		alert("Email field is empty!");
	}
}

async function registrSequence() {
	const email = document.getElementById('loginEmail').value;
	const emailConfr = document.getElementById('registrEmailConfr').value;
	const password = document.getElementById('registrPassword').value;
	const passwordConfr = document.getElementById('registrPasswordConfr').value;
	const name = document.getElementById('registrName').value;
	const surname = document.getElementById('registrSurname').value;
	const username = document.getElementById('registrUsername').value;
	if (email !== "" && emailConfr !== "" && password !== "" && passwordConfr !== "" && name !== "" && surname !== "" && username !== "" ) {
		if (email === emailConfr) {
			if (password === passwordConfr) {
				let response = await fetch(`http://localhost:3000/hash`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json',	}, body: JSON.stringify({password: password}), });
				if (response.ok) {
					const hashedPass = await response.json();
					registrFunction(email, hashedPass, name, surname, username);
				} else {
					console.error("Registration error!")
				}
			} else {
				console.error("Registration error: Password are different");
				alert("Password are not equals!");
			}
		} else {
			console.error("Registration error: Emails are different");
			alert("Emails are not equals!");
		}
	} else {
		alert("You missed some fields, fill all of them and retry!");
		console.error("Registration error: missing some fileds")
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
		image.src = `${character.thumbnail.path}.${character.thumbnail.extension}`
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
