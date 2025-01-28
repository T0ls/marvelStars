// DETAILS
let apparitionsData = [];
document.addEventListener('DOMContentLoaded', function () {
	saveToLS("searchText", "");
});

async function showCharacterApparitions() {
	const array = ["Comic", "Event", "Serie"];
	const characterId = getCharacterId();

	for(let x of array) {
		let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${characterId}/${x.toLowerCase()}s`);
		url.searchParams.append('limit', 20);

		const response = await fetch(url.href);
		const dataFetch = await response.json();
		const data = dataFetch.data.results;
		let arrayElement = [];
		data.forEach(item => {
			let app = {
				title: "",
				thumbnail: {
					"path": "",
					"extension": ""
				}, 
			};
			app.title = item.title;
			app.thumbnail.path = item.thumbnail.path;
			app.thumbnail.extension = item.thumbnail.extension;
			arrayElement.push(app);
		});
		apparitionsData.push(arrayElement);
		createCarousel(x, data);
	}
}

function showCharacterApparitionsUpdatedWidth() {
	const array = ["Comic", "Event", "Serie"];
	// clearo le old apparitions
	const firstDiv = document.querySelector('#apparitionsGenDiv');
	const childDivs = firstDiv.querySelectorAll(':scope > div');
	childDivs.forEach(div => div.remove());

	for(let i=0; i<array.length; i++) {
		let data = apparitionsData[i];
		createCarousel(array[i], data);
	}
}

function createCarousel(name, data) {
	let dim = getScreenDim();
    const containerGen = document.getElementById('apparitionsGenDiv');
    const carouselGen = containerGen.firstElementChild;

	const carouselClone = carouselGen.content.cloneNode(true);
	carouselClone.querySelector('#noXFoundH5').innerHTML = `No ${name}s were found!`;
	carouselClone.querySelector('#apparitionXCategory').innerHTML = `${name}s`;
	carouselClone.querySelector('#carouselExample').id = `carouselExample${name}`;
	carouselClone.querySelector('#carouselControlPrev').setAttribute("data-bs-target", `#carouselExample${name}`);
	carouselClone.querySelector('#carouselControlNext').setAttribute("data-bs-target", `#carouselExample${name}`);

	if (data.length === 0 ) {
		carouselClone.querySelector('#noXFound').classList.remove("d-none");
		carouselClone.querySelector('#noXFound').classList.add("d-block");

		carouselClone.querySelector('#carouselX').classList.remove("d-block");
		carouselClone.querySelector('#carouselX').classList.add("d-none");
		carouselClone.querySelector('#apparitionXCategory2').innerHTML = `${name}s:`;
		containerGen.appendChild(carouselClone);
		return; 
	} else if (data.length <= dim) {
		const activePageParent = carouselClone.querySelector('#containerXApparitionsActive');
		fillCarouselPage(data, carouselClone, activePageParent);
		containerGen.appendChild(carouselClone);
		return;
	}

	const activePageParent = carouselClone.querySelector('#containerXApparitionsActive');
	fillCarouselPage(data.slice(0, dim), carouselClone, activePageParent);

	const inactivePageTemplate = carouselClone.querySelector('#templateXApparitionsTemplateContainer');
	const inactivePageParent = inactivePageTemplate.parentElement;
	for (let i=1; i<data.length/dim; i++) {
		const clone = inactivePageTemplate.content.cloneNode(true);
		const cardParent = clone.querySelector('#containerXApparitionsInactive');

		fillCarouselPage(data.slice(dim * i, dim * (i + 1)), clone, cardParent);
		inactivePageParent.appendChild(clone);
	}
	containerGen.appendChild(carouselClone);
}

async function showCharacterDetails() {
	const characterId = getCharacterId();
	let url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${characterId}`);
	url.searchParams.append('limit', 1);

	const response = await fetch(url.href);
	const characterData = await response.json();

    const name = document.getElementById('heroName');
    const image = document.getElementById('heroImg');
    const description = document.getElementById('heroDescr');
    const lastModify = document.getElementById('lastMod');

	name.innerHTML = characterData.data.results[0].name;
	image.src = `${characterData.data.results[0].thumbnail.path}.${characterData.data.results[0].thumbnail.extension}`;

	if (characterData.data.results[0].description.trim() !== "") {
		description.innerHTML = characterData.data.results[0].description;
	} else {
		description.innerHTML = "no description was found"; 
	}
	lastModify.innerHTML = characterData.data.results[0].modified;
}

// Old script
showCharacterDetails();
showCharacterApparitions();

function onWidthChange(callback) {
	let lastWidth = window.innerWidth;

	window.addEventListener('resize',() => {
		let currentWidth = window.innerWidth;
		if (getDimW(currentWidth) !== getDimW(lastWidth)) {
			lastWidth = currentWidth;
			callback();
		}
	});
}

function getDimW(widthS) {
	switch (true) {
		case (widthS <= 576):
			dim = 1;
		break;
		case (widthS > 576 && widthS <= 768):
			dim = 2;
		break;
		case (widthS > 768 && widthS <= 992):
			dim = 4;
		break;
		case (widthS > 992):
			dim = 5;
		break;
	}
	return dim
}

// Utilizzo della funzione
onWidthChange(function() {
	showCharacterApparitionsUpdatedWidth();
});
