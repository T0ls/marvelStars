// HOMEPAGE
async function showHomepage(offset) {
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
		button.href = "details.html?id=" + character.id;

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
			showHomepage(page*20);
        }
    } else if (action === 1) {
        // Next
        if ((page+1)*20 < totalCharacters) {
            page++;
			prevElement.classList.remove("disabled");
            saveToLS('pageNumber', page);
			changePage(2);
			showHomepage(page*20)
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
	showHomepage(0);
}

// imposto max width schede 
let figurinaImgs = document.querySelectorAll('.figurinaImg');

figurinaImgs.forEach(function(img, index) {
	let imgWidth = img.offsetWidth;
	let figurinaName = document.querySelectorAll('.figurinaName')[index];
	figurinaName.style.width = imgWidth + 'px';
});

document.addEventListener('DOMContentLoaded', function () {
	saveToLS("searchText", "");
	showHomepage(0);
	saveToLS('pageNumber', 0);
	changePage(0);
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
