// SHOP
document.addEventListener('DOMContentLoaded', function () {
	saveToLS("searchText", "");
});

let shopData = [];
const shopInitialData = [
  {
    category: "Hero Points",
    img: "assets/heroPoints.png",
    quantities: ["x100", "x200", "x500", "x2000", "x5000", "x10000"],
    prices: ["5", "9", "20", "70", "150", "250"]
  },
  {
    category: "Normal Packs",
    img: "assets/packs/common/still/STILL.png",
    quantities: ["x1", "x2", "x5", "x20", "x50"],
    prices: ["12", "23", "55", "210", "500"]
  },
  {
    category: "Epic Packs",
    img: "assets/packs/epic/still/STILL.png",
    quantities: ["x1", "x2", "x5", "x20", "x50"],
    prices: ["102", "203", "505", "2010", "5000"]
  },
  {
    category: "Legendary Packs",
    img: "assets/packs/legendary/still/STILL.png",
    quantities: ["x1", "x2", "x5", "x20", "x50"],
    prices: ["202", "403", "1005", "4010", "10000"]
  }
];

function showShopUpdatedWidth() {
	const array = ["Hero Points", "Normal Pack", "Epic Pack", "Legendary Pack"];
	// clearo le old shop
	const firstDiv = document.querySelector('#shopGenDiv');
	const childDivs = firstDiv.querySelectorAll(':scope > div');
	childDivs.forEach(div => div.remove());

	for(let i=0; i<array.length; i++) {
		let data = shopData[i];
		createCarouselShop(array[i], data);
	}
}

//iniazializzo e riempio l'array dell shop
function initializeShop() {
	const array = ["Hero Points", "Normal Pack", "Epic Pack", "Legendary Pack"];
	shopData = generateData(shopInitialData);

	for(let i=0; i < array.length; i++) {
		createCarouselShop(array[i], shopData[i]);
	}
}

function generateData(input) {
  return input.map(categoryData => {
    const { img, quantities, prices } = categoryData;
    const path = `../${img.split('.')[0]}`;
    const extension = img.split('.')[1];

    const items = quantities.map((quantity, i) => ({
      title: quantity,
      prices: prices[i],
      thumbnail: {
        path: path,
        extension: extension
      }
    }));
	return items
  });
}

function createCarouselShop(name, data) {
	// dim hp: x100 x200 x500 x2000 x5000 x10000
	// dim packs: x1 x2 x5 x20 x51
	let dim = getScreenDim();
    const containerGen = document.getElementById('shopGenDiv'); //mod id
    const carouselGen = containerGen.firstElementChild;

	const carouselClone = carouselGen.content.cloneNode(true);
	carouselClone.querySelector('#shopXCategory').innerHTML = `${name}`;
	carouselClone.querySelector('#carouselExample').id = `carouselExample${name.split(" ")[0]}`;
	carouselClone.querySelector('#carouselControlPrev').setAttribute("data-bs-target", `#carouselExample${name.split(" ")[0]}`);
	carouselClone.querySelector('#carouselControlNext').setAttribute("data-bs-target", `#carouselExample${name.split(" ")[0]}`);

	if (data.length <= dim) {
		const activePageParent = carouselClone.querySelector('#containerXshopActive');
		fillShopCarouselPage(data, carouselClone, activePageParent, name);
		containerGen.appendChild(carouselClone);
		return;
	}

	const activePageParent = carouselClone.querySelector('#containerXshopActive');
	fillShopCarouselPage(data.slice(0, dim), carouselClone, activePageParent, name);

	if (data.length <= dim) {
		const activePageParent = carouselClone.querySelector('#containerXShopActive');
		fillShopCarouselPage(data, carouselClone, activePageParent, name);
		containerGen.appendChild(carouselClone);
		return;
	}

	const inactivePageTemplate = carouselClone.querySelector('#templateXshopTemplateContainer');
	const inactivePageParent = inactivePageTemplate.parentElement;
	for (let i=1; i<data.length/dim; i++) {
		const clone = inactivePageTemplate.content.cloneNode(true);
		const cardParent = clone.querySelector('#containerXshopInactive');

		fillShopCarouselPage(data.slice(dim * i, dim * (i + 1)), clone, cardParent, name);
		inactivePageParent.appendChild(clone);
	}
	containerGen.appendChild(carouselClone);
}

function fillShopCarouselPage(data, pageClone, parent, type) {
	const elementGen = pageClone.querySelector('#templateshop');

	data.forEach(app => {
		let clone = elementGen.content.cloneNode(true);

		if (data[0].title === "x1" || data[0].title === "x2" || data[0].title === "x5" || data[0].title === "x20" || data[0].title === "x50") {
			const elem = clone.querySelector('.detailsCardImg')
			elem.classList.remove("detailsCardImg");
			elem.classList.add("detailsCardImgPacks");
		}

		let image = clone.querySelector('img');
		let button = clone.querySelector('button');

		image.src = `${app.thumbnail.path}.${app.thumbnail.extension}`
		button.innerHTML = app.title;
		const path = window.location.href;
		const newPath = path.split("/");
		if (newPath[3] === "unlogged") {
			button.setAttribute("onClick", "clickLogin()");
		} else {
			if (type === "Hero Points") {
				button.setAttribute("data-bs-target", "#modalPaymentDollar");
			} else {
				button.setAttribute("data-bs-target", "#modalPaymentHp");
			}
			button.setAttribute("data-bs-toggle", "modal");
			button.setAttribute("data-params", `${parseInt(app.prices.replace(/\D/g, ''), 10)};${type};${app.title}`);
		}

		parent.appendChild(clone);
	});
}

//Old scritp
initializeShop();

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
	showShopUpdatedWidth();
});

// fix hp buy cluse modal
