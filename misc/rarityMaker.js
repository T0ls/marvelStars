/*
console.log();
*/

const fs = require('fs');
//"importo" md5
var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_};

//Key: giugiust2002@gmail.com
const sk = '27f99fbdc2dc8fe8a301191619c41b0d810fee05';
const pk = '971cfa49d0457e65f3b05b3ef0017139';

//Key: giulio.giusteschi@studenti.unimi.it
//const sk = '407aaef25abbd693fdfb553559e07a1f6803bb4e';
//const pk = 'c5fbdc274b4abd21a2049ee9eeed4d69';

//Key: arance.rosse@gmail.com
//const sk = '7a21d97ca59ce9ea54f5fa3e71bc76592c16828e';
//const pk = '68a2a54fe5fe55c4b298f16cedd20d64';

function getAuthedURL(base) {
    const url = new URL(base);
    const timestamp = "" + Date.now();
    url.searchParams.append('apikey', pk);
    url.searchParams.append('ts', timestamp);
    url.searchParams.append('hash', MD5(timestamp + sk + pk).toString());
    return url;
}

// legge tutti i personaggi e li inserisce in un'arrray assegnandogli npt e punteggio
async function readCharacterData() {
	const result = [];
	let offset = 0;
	let totalCharacters = Infinity;
	
	while (offset < totalCharacters) {
		let url = getAuthedURL('https://gateway.marvel.com/v1/public/characters');
		url.searchParams.append('limit', 20);
		url.searchParams.append('offset', offset);
		
		const response = await fetch(url.href);
		const characterData = await response.json();

		totalCharacters = characterData.data.total;

		for (i=0; i < characterData.data.results.length; i++) {
			//alternativa a console.log()  
			process.stderr.write(`Status: ${offset + i + 1} of ${totalCharacters}\n`);
			const character = characterData.data.results[i];
			
			url = getAuthedURL(`https://gateway.marvel.com/v1/public/characters/${character.id}/comics`);
			const response = await fetch(url.href);
			const characterComicData = await response.json();

			result.push({
				id: character.id,
				npt: characterComicData.data.total
			});
		}
		offset += 20;
	}

	return result;
}


function createRarity(filePath, outputFilePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Errore nella lettura del file:', err);
            return;
        }

        try {
            // Parsing del contenuto JSON
            const arr = JSON.parse(data);

			// Calcoliamo la lunghezza dell'array
			const len = arr.length;

			// Calcoliamo i limiti per ogni categoria di rarità
			const commonLimit = Math.floor(len * 0.40);
			const rareLimit = commonLimit + Math.floor(len * 0.30);
			const epicLimit = rareLimit + Math.floor(len * 0.20);

			// Iteriamo sull'array e assegnamo la rarità in base alla posizione
			for (let i = 0; i < len; i++) {
				if (i < commonLimit) {
					arr[i].rarity = 'common';
				} else if (i < rareLimit) {
					arr[i].rarity = 'rare';
				} else if (i < epicLimit) {
					arr[i].rarity = 'epic';
				} else {
					arr[i].rarity = 'legendary';
				}
			}
			console.error('array:', arr);
            // Scrivi l'array ordinato in un nuovo file JSON
            fs.writeFile(outputFilePath, JSON.stringify(arr, null, 2), (err) => {
                if (err) {
                    console.error('Errore nella scrittura del file:', err);
                    return;
                }
                console.log(`Array ordinato salvato in ${outputFilePath}`);
            });
			return arr;
        } catch (e) {
            console.error('Errore nel parsing del JSON:', e);
        }
    });
}

function createBasePrice(array, range, bPrice) {
  const lenght = array.length;
  const resto = lenght % range;
  const x = Math.floor(lenght / range);
  let count = 1;
  // imposto punteggio iniziale a 0 per primi elementi
  for (let i = 0; i < resto; i++) {
    array[i].priceInitial = bPrice;
  }
  // imposta punteggi per restanti elementi
  for (let i = resto; i < lenght; i += x) {
    for (let j = i; j < i + x && j < lenght; j++) {
      array[j].priceInitial = count + bPrice;
    }
    count++;
    if (count > range) {
      count = 1;
    }
  }
  return array;
}

function createDbFinale(filePath, outputFilePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Errore nella lettura del file:', err);
            return;
		}

		try {
			// Parsing del contenuto JSON
			const updatedArray = JSON.parse(data);

			// Suddividiamo l'array aggiornato in base alla rarità
			let commonArray = updatedArray.filter(item => item.rarity === 'common');
			let rareArray = updatedArray.filter(item => item.rarity === 'rare');
			let epicArray = updatedArray.filter(item => item.rarity === 'epic');
			let legendaryArray = updatedArray.filter(item => item.rarity === 'legendary');

			// Chiamiamo createBasePrice per ciascun gruppo con la percentuale corrispondente
			commonArray = createBasePrice(commonArray, 40, 20);
			//console.log("Common:",JSON.stringify(commonArray, null ,2));
			rareArray = createBasePrice(rareArray, 50, 60);
			//console.log("Rare:",JSON.stringify(rareArray, null ,2));
			epicArray = createBasePrice(epicArray, 100, 110);
			//console.log("Epic:",JSON.stringify(epicArray, null ,2));
			legendaryArray = createBasePrice(legendaryArray, 150, 210);
			//console.log("Legendary:",JSON.stringify(legendaryArray, null ,2));

			// Combiniamo di nuovo tutti gli elementi in un unico array
			let combinedArray = [...commonArray, ...rareArray, ...epicArray, ...legendaryArray];

			fs.writeFile(outputFilePath, JSON.stringify(combinedArray, null, 2), (err) => {
				if (err) {
					console.error('Errore nella scrittura del file:', err);
					return;
				}
				console.log(`Array ordinato salvato in ${outputFilePath}`);
			});
		} catch (e) {
			console.error('Errore nel parsing del JSON:', e);
		}
	});
}

async function main() {
	//const characters = await readCharacterData();
	//console.log(JSON.stringify(characters));
	createDbFinale("rarityCreated.json", "finale.json");
}

main();

/*
	- 1 estendo funzionalità baratto tra amici a stockmarket
	- 2 vendo figurine x crediti (stockmarket)
	- 3 account admin che modifica x se stesso i prezzi 
*/

// calcola i ratings [deprecata]
function calcolaRating() {
    const inputFilePath = 'ordinato.json';
    const outputFilePath = 'ratings.json';
    const Nft = 60434;
    const maxAl = 0.07413045636562200086044279710097;

    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Errore nella lettura del file:', err);
            return;
        }

        try {
            // Parsing del contenuto JSON
            const jsonArray = JSON.parse(data);

            // Applica la formula per calcolare il rating
            const results = jsonArray.map((element, index) => {
                const Npt = element.npt;
                const al = Npt / Nft;
                const rating = 100 - (al / maxAl) * 100;

                // Determina la rarità in base alla posizione nell'array
                let rarity;
                if (index < 626) {
                    rarity = 'common';
                } else if (index < 1096) {
                    rarity = 'rare';
                } else if (index < 1407) {
                    rarity = 'epic';
                } else {
                    rarity = 'legendary';
                }

                return {
                    id: element.id,
                    ratingPercent: rating,
                    rarity: rarity
                };
            });

            // Scrivi il risultato in un nuovo file JSON
            fs.writeFile(outputFilePath, JSON.stringify(results, null, 2), (err) => {
                if (err) {
                    console.error('Errore nella scrittura del file:', err);
                    return;
                }
                console.log(`Ratings e rarità calcolati e salvati in ${outputFilePath}`);
            });

        } catch (e) {
            console.error('Errore nel parsing del JSON:', e);
        }
    });
}

// Rating = 100 - (al[n] / max(al)) * 100
// al[n] = apparizioni[n] / totalComic

// calcola il rating in punteggio percentuale [deprecato]
function sortJson(filePath, outputFilePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Errore nella lettura del file:', err);
            return;
        }

        try {
            // Parsing del contenuto JSON
            const jsonArray = JSON.parse(data);

            // Definisci l'ordine di rarità
            const rarityOrder = {
                'legendary': 1,
                'epic': 2,
                'rare': 3,
                'common': 4
            };

            // Ordina prima per rating e poi per rarità
            jsonArray.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                } else {
                    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
                }
            });

            // Scrivi l'array ordinato in un nuovo file JSON
            fs.writeFile(outputFilePath, JSON.stringify(jsonArray, null, 2), (err) => {
                if (err) {
                    console.error('Errore nella scrittura del file:', err);
                    return;
                }
                console.log(`Array ordinato salvato in ${outputFilePath}`);
            });

        } catch (e) {
            console.error('Errore nel parsing del JSON:', e);
        }
    });
}
