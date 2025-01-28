document.addEventListener('DOMContentLoaded', function() {
	saveToLS("searchText", "");
	loadUserData();
});

async function loadUserData() {
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
			document.getElementById("accountUsername").childNodes[1].nodeValue = " " + results.username;
			document.getElementById("accountName").childNodes[1].nodeValue = " " + results.name + " " + results.surname;
			document.getElementById("accountEmail").childNodes[1].nodeValue = " " + results.email;
			const date = new Date(results.creationDate)
			document.getElementById("accountCreationDate").childNodes[1].nodeValue = " " + date.toLocaleString('en-US', { timeZone: 'UTC' });
			const pElement = document.getElementById("accountHp");
			const textNode = Array.from(pElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
			textNode.nodeValue = " " + results.hp;
			document.getElementById("accountProfileName").innerHTML = results.username + " Profile";

			if (results.favoredHero !== null) {
				let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${results.favoredHero}`);
				url.searchParams.append('limit', 1);
				const res = await fetch(url.href);
				const heroData = await res.json();
				document.getElementById("accountFavoredHero").childNodes[1].nodeValue = " " + heroData.data.results[0].name;
				document.getElementById("profileImg").src = heroData.data.results[0].thumbnail.path + "." + heroData.data.results[0].thumbnail.extension;
			}

			console.log(results)
			// SU section
			if (results.userId === 100000) {
				document.getElementById("suDiv").classList.remove("d-none");
			}
		} else {
			console.error('Error:', response.status, response.statusText);
		}
	} else {
		window.location.href = '/unlogged/homePage.html';
	}
}

async function deleteAccount() {
	const [exist, _] = checkCookieExists("token");
	if (exist) {
		let response = await fetch(`http://localhost:3000/users/delete`, {
			method: 'DELETE',
			headers: { 
				'Accept': 'application/json', 
				'Content-Type': 'application/json',
			},
		});
		if (response.ok) {
			console.log("Account delete Succesfully!");
			window.location.href = '/unlogged/homePage.html';
		} else {
			console.error('Error:', response.status, response.statusText);
			window.location.href = '/logged/account.html';
		}
	} else {
		window.location.href = '/unlogged/homePage.html';
	}
}

async function getAccess() {
	const userId = parseInt(document.getElementById("userIdForSu").value);
	let response = await fetch(`http://localhost:3000/sU/getUserAccess/${userId}`, {
		method: 'GET',
		headers: { 
			'Accept': 'application/json', 
			'Content-Type': 'application/json',
		},
	});
	if (response.ok) {
		window.location.href = '/logged/account.html';
	} else {
		console.error('Error:', response.status, response.statusText);
	}
}
