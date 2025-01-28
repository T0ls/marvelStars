const logToFile = require('./logs/logging.js');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swaggerOutput.json');

const { MongoClient, ObjectableId, Code } = require('mongodb');
const { debug } = require('console');
const DB_NAME = "marvelStarsDB";
const uri = "mongodb+srv://password:exemple@DBexample.xivrlmn.mongodb.net";
const client = new MongoClient(uri);
let pwmClient;
connectDb();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('.'));
app.use('/docs/apiSwagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Stampa il link al sito
console.log('\n\x1b[31mLink to the site:\x1b[0m http://localhost:3000/logged/homePage.html');
// Avvia il client del DB
async function connectDb() {
	pwmClient = await client.connect();
}

async function closeDb() {
	await client.close();
	console.log("Closing mongo Db Connection...");
	process.exit(0);
}

// Intercetta il segnale SIGINT (Ctrl + C)
process.on('SIGINT', () => {
	console.log('Ricevuto il segnale SIGINT (Ctrl + C).');
	closeDb();
});

// Avvia il server
app.listen(port, '0.0.0.0', () => {
	console.log(`\x1b[31mAPI\x1b[0m Workin on port: \x1b[32m${port}\x1b[0m`);
});

// Funzione per data e ora dei console
(function() {
	// Salva l'originale console.log e console.error in una variabile
	const originalLog = console.log;
	const originalError = console.error;

	// Variabile per tenere traccia dell'ultimo timestamp e dello stato dei log
	let lastSuccess = null;
	let lastWarn = null;
	let lastDebug = null;
	let lastError = null;
	const currTimestamp = new Date();
	let lastTimestamp = new Date(currTimestamp.getTime() - 5 * 1000);
	let lastTimestampErrors = new Date(currTimestamp.getTime() - 5 * 1000);

	// Sovrascrivi console.log con una nuova funzione
	console.log = function(...args) {
		// Ottieni la data e l'ora attuali
		const currentTimestamp = new Date().toLocaleString();

		// Converte gli argomenti in una stringa concatenata
		const logString = args.map(arg => {
			if (typeof arg === 'object') {
				return JSON.stringify(arg); // Oggetti convertiti in JSON
			}
			return String(arg); // Tutto il resto convertito in stringa
		}).join(' '); // Unisci tutti gli argomenti con uno spazio

		//console.warn( "curr",logString, "||" ,lastSuccess , "last")
		// Call func x log Info
		if (logString.includes('Success:')) {
			if (lastTimestamp !== currentTimestamp || lastSuccess !== logString) {
				logToFile(logString.replace(/\x1b\[\d{1,2}m/g, '').replace(/successfully!*/g, '').replace(/Success: /g, ''), "info");
			}
			lastSuccess = logString;
		}

		// Call func x log Warn
		if (logString.includes('Warning:')) {
			if (lastTimestamp !== currentTimestamp || lastWarn !== logString) {
				logToFile(logString.replace(/\x1b\[\d{1,2}m/g, '').replace(/successfully!*/g, '').replace(/Warn: /g, ''), "warn");
			}
			lastWarn = logString;
		}

		// Call func x log Debug
		if (logString.includes('Debug:')) {
			if (lastTimestamp !== currentTimestamp || lastDebug !== logString) {
				logToFile(logString.replace(/\x1b\[\d{1,2}m/g, '').replace(/successfully!*/g, '').replace(/Debug: /g, ''), "debug");
			}
			lastDebug = logString;
		}

		if (currentTimestamp !== lastTimestamp) {
			originalLog(`\n\x1b[90m[${currentTimestamp}]\x1b[0m`, ...args);
			lastTimestamp = currentTimestamp; // Aggiorna l'ultimo timestamp
		} else {
			// Calcola la lunghezza del timestamp per allineare i messaggi successivi
			const spaces = ' '.repeat(currentTimestamp.length + 3); // +3 per includere "[ ]" e un ulteriore spazio
			const spacedArgs = args.map(arg => spaces + String(arg)); // Aggiungi spazi all'inizio di ogni argomento
			// Stampa il messaggio con gli spazi allineati
			originalLog(...spacedArgs);
		}
	};

	// Sovrascrivi console.error con una nuova funzione
	console.error = function(...args) {
		// Ottieni la data e l'ora attuali
		const currentTimestamp = new Date().toLocaleString();

		// Converte gli argomenti in una stringa concatenata
		const errorString = args.map(arg => {
			if (typeof arg === 'object') {
				return JSON.stringify(arg, Object.getOwnPropertyNames(arg)); // Oggetti convertiti in JSON con tutte le proprietà
			}
			return String(arg); // Tutto il resto convertito in stringa
		}).join(' '); // Unisci tutti gli argomenti con uno spazio

		// Call func x log Error
		if (errorString.includes('Error:')) {
			if (lastTimestampErrors !== currentTimestamp || lastError !== errorString) {
				logToFile(errorString.replace(/\x1b\[\d{1,2}m/g, ''), "errors");
			}
			lastError = errorString;
		}

		// Stampa l'errore con il timestamp
		if (currentTimestamp !== lastTimestampErrors) {
			originalError(`\x1b[90m[${currentTimestamp}]\x1b[0m`, ...args);
			lastTimestampErrors = currentTimestamp; // Aggiorna l'ultimo timestamp
		} else {
			originalError(...args);
		}
	};

})();



// Map for genereted Cookies
const generatedCookies = new Map();

function addToMap(mapName, cookieData) {
	const expireDate = new Date(cookieData.expireDate);
	mapName.set(cookieData.cookieValue, { userId: cookieData.userId, expireDate: expireDate });
}

// Cookie checking part
function cookieChecking(res, userCookie) {
	if (userCookie === undefined) {
		console.error(`\x1b[33mWarning:\x1b[0m no cookies were found!`);
		return res.status(404).json(`Unauthorized: no cookies were found!`);
	}
	const currentDate = new Date();
	const userCookieName = userCookie.split("!")[0].split("=")[1];
	const userId = userCookie.split("!")[1];
	const dbCookie = generatedCookies.get(userCookieName);
	//console.log("User:", userCookieName, userId);
	//console.log("DB:  ", dbCookie);
	if (userCookie !== null && dbCookie) {
		if (userId === undefined) {
			console.log(`\x1b[33mWarning:\x1b[0m userId-{${userId}}- from cookie is undefined`);
		}
		if (currentDate <= dbCookie.expireDate) {
			if (userId === dbCookie.userId) {
				console.log(`\x1b[35mDebug:\x1b[0m Cookie Authorized, user -{${userId}}- has logged successfully!`);
				return true;
			} else {
				console.log(`\x1b[33mWarning:\x1b[0m Unauthorized, user -{${dbCookie.userId}}- has tried to log with a wrong userId= ${userId}`);
				return res.status(401).json(`Unauthorized: user has tried to log with a wrong userId`);
			}
		} else {
			generatedCookies.delete(userCookie);
			console.log(`\x1b[33mWarning:\x1b[0m Unauthorized, user -{${userId}}- has tried to log with an expired cookie`);
			return res.status(401).json(`Unauthorized: user has tried to log with an expired cookie`);
		}
	} else {
		console.log(`\x1b[33mWarning:\x1b[0m Unauthorized, user -{${userId}}- has tried to log with a non present cookie`);
		return res.status(401).json(`Unauthorized: user has tried to log with a non valid cookie`);
	}
}

// Hash password with sha256
function hashPassword(password) {
	return crypto.createHash('sha256').update(password).digest('hex');
}

// Get user by Id
async function getUsersById(id) {
	try {
		const user = await pwmClient.db(DB_NAME).collection("users").findOne({ id: String(id) });
		return user;
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
}

// Add to queues
async function queueAdder (queueName, newFree) {
	try {
		// Trova il documento con `id: "0"`
		const userDoc = await pwmClient.db(DB_NAME).collection("users").findOne({ id: String(0) });

		if (userDoc && userDoc[queueName]) {
			const filter = { id: "0"};
			const update = { $push: { [queueName]: newFree } };

			const result = await pwmClient.db(DB_NAME).collection("users").updateOne(filter, update);
			console.log(`\x1b[35mDebug:\x1b[0m Queue(${queueName}) successfully updated: ${result.modifiedCount}`);
		} else {
			console.error('Document not found or inexisting queue.');
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
	}
}

// Remove from queues
async function queueRemover(queueName, ammount) {
	try {
		// Trova il documento con `id: "0"`
		const userDoc = await pwmClient.db(DB_NAME).collection("users").findOne({ id: String(0) });

		if (userDoc && userDoc[queueName]) {
			// Rimuovi gli elementi dall'inizio dell'array
			const updatedQueue = userDoc[queueName].slice(ammount);

			// Aggiorna il documento nel database
			const result = await pwmClient.db(DB_NAME).collection("users").updateOne(
				{ id: String(0) },  // Criterio di ricerca
				{ $set: { [queueName]: updatedQueue } }
			);

			console.log(`\x1b[35mDebug:\x1b[0m Queue(${queueName}) successfully updated: ${result.modifiedCount}`);
		} else {
			console.error('Document not found or inexisting queue.');
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
}

// Check Cookies Route
app.get("/users/checkLogged", (req, res) => {
// #swagger.ignore = true
	try {
		const check = cookieChecking(res, req.headers.cookie);
		//console.table(req.headers.cookie);
		if (check === true) {
			res.status(200).send("Cookie Authorized!");
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Hash Password Route
app.post('/hash', (req, res) => {
// #swagger.ignore = true
	try {
		const { password } = req.body;
		if (!password) {
			return res.status(400).send('Password is required');
		}

		const hash = hashPassword(password);
		//console.log("Password hashed",hash)
		res.json(hash);
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Search Email Route
app.get("/users/checkEmail/:email", async (req, res) => {
	// #swagger.ignore = true
	try {
		const email = req.params.email;
		const user = await pwmClient.db(DB_NAME).collection("users").findOne({ email: email });
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: `User not found with email: ${email}` });
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Get User profile data Route
app.get("/users/getData", async (req, res) => {
	// #swagger.tags = ['Users']
	// #swagger.summary = Get User Data
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userCookie = req.headers.cookie;
			const userId = parseInt(userCookie.split("!")[1]);
			const user = await pwmClient.db(DB_NAME).collection("users").findOne(
				{ userID: userId }, // imposto il filtro x trovare l0utente
			);

			if (user) {
				if (user.favoredHeroId !== null) {
					console.log(`\x1b[35mDebug:\x1b[0m user -{${userId}}- account data extracted successfully!`);
					res.status(200).json({ name: user.name, surname: user.surname, username: user.username, email: user.email, favoredHero: user.favoredHeroId, hp: user.hP, creationDate: user.creationDate, userId: user.userID});
				} else {
					console.log(`\x1b[32mSuccess:\x1b[0m (partial) user -{${userId}}- account data extracted with missing FavoredHero!`);
					res.status(206).json({ name: user.name, surname: user.surname, username: user.username, email: user.email, favoredHero: user.favoredHeroId, hp: user.hP, creationDate: user.creationDate, userId: user.userID});
				}
			} else {
				console.log(`\x1b[33mWarning:\x1b[0m No user were found with id: -{${userId}}-`);
				res.status(404).json({ error: `No user were found with userId: ${userId}` });
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Get Pack quantity Route
app.get('/users/packsQuantity', async (req, res) => {
	// #swagger.tags = ['Users']
	// #swagger.summary = Get User packs quantity
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({userID: parseInt(userId)});
			if (!user) {
				console.error(`\x1b[33mWarning:\x1b[0m user, -{${userId}}- was not found!`);
				return res.status(404).json({message: 'User not found' });
			}
			return res.json({ common: user.packs.common, epic: user.packs.epic, legendary: user.packs.legendary});
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Logout Route
app.get('/users/logout',(req, res) => {
	// #swagger.tags = ['Users']
	// #swagger.summary = Logout User
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userCookie = req.headers.cookie;
			//console.log(cookie)
			const userCookieName = userCookie.split("!")[0].split("=")[1];
			const userId = userCookie.split("!")[1];
			generatedCookies.delete(userCookieName);
			console.log(`\x1b[32mSuccess:\x1b[0m LOGOUT User, -{${userId}}- has logged out!`);
			res.setHeader('Set-Cookie', `token=${userCookieName}; Max-Age=0; Path=/`);
			res.status(200).json(`User with token: ${userCookieName} has been removed!`);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Login Route
app.post('/users/login', async (req, res) => {
	/*#swagger.tags = ['Users']
	#swagger.summary = Log a user into his account using credential
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/userLogin"
				}
			}
		}
	}*/
	try {
		let body = req.body;
		const passwordBody = body.password;
		//console.log("PB",passwordBody);
		// Cerca un utente con l'email specificata
		const user = await pwmClient.db(DB_NAME).collection("users").findOne({
			email: body.email.toLowerCase()
		});

		//console.log("email",user);
		if (user) {
			// Recupera la password utilizzando il passwordId dell'utente
			let password = await pwmClient.db(DB_NAME).collection("password").findOne({ passwordId: String(user.passwordId) });
			password = password.password;
			//console.log('Password:', password);

			if (password) {
				if (passwordBody === password) {
					// Se password OK allora genero cookies
					const expires = new Date(Date.now() + 1000 * 60 * 60 * 8);
					expires.setMilliseconds(0);
					const tokenValue = Math.random().toString(36).substr(2);
					// Creo il cookie da mandare in risposta
					res.setHeader("Set-Cookie", [
						`token=${tokenValue}!${user.userID}; Expires=${expires.toUTCString()}; Path=/`,
					]);
					// Aggiungo il cookie alla mia mappa nel server
					const newCookie = { userId: String(user.userID), cookieValue: tokenValue, expireDate: expires};
					addToMap(generatedCookies , newCookie);
					if (generatedCookies.get(tokenValue)) {
						console.log('\x1b[35mDebug:\x1b[0m GeneratedCookies Map, Successfully updated!');
						//console.table([...generatedCookies]);
					} else {
						console.log('\x1b[35mDebug:\x1b[0m during GeneratedCookies map update!');
						console.table([...generatedCookies]);
					}
					console.log(`\x1b[32mSuccess:\x1b[0m LOGIN Authorized, user -{${user.userID}}- has logged successfully!`)
				res.json({ id: user.userID });
				} else {
					res.status(401).json({ error: 'Wrong Password!' });
					console.log(`\x1b[33mWarning:\x1b[0m userId, -{${user.userID}}- has tried to log with a wrong password: \n${passwordBody}\n${password}\n`);
				}
			} else {
				res.status(404).json({ error: `Password with passwordId: ${user.passwordId} not found` });
				console.log(`\x1b[33mWarning:\x1b[0m password with passwordId, -{${user.passwordId}}- were not found in DB\n`);
			}
		} else {
			res.status(404).json({ error: `User with email: ${body.email} not found` });
			console.log(`\x1b[33mWarning:\x1b[0m User with email, -{${body.email}}- were not found in DB\n`);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Registration Route
app.post("/users/registr", async (req, res) => {
	/*#swagger.tags = ['Users']
	#swagger.summary = Create and add a new user to the platform!
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/userSignIn"
				}
			}
		}
	}*/

	try {
		// Add new User to database
		const user = req.body
		let newUserId = null
		let newPasswordId = null
		let newCollectionId = null
		let newOrderTableId = null
		const hP = 0;
		const packs = {
			"legendary": 0,
			"epic": 0,
			"common": 5
		}
		const queueIds = await getUsersById("0");	
		const idsCounters = await getUsersById("1");	
		// User Ids
		if (queueIds.userIdFree.length !== 0) {
			newUserId = queueIds.userIdFree[0];	
			await queueRemover("userIdFree", 1);
		} else {
			newUserId = idsCounters.userIDC;
			// Update counter values
			let query = {userIDC: idsCounters.userIDC};
			query = {userIDC: idsCounters.userIDC};
			const updateIDC = {$set: {userIDC: idsCounters.userIDC + 1}};
			await pwmClient.db(DB_NAME).collection("users").updateOne(query, updateIDC);
		}
		// Password Ids
		if (queueIds.passwordIdFree.length !== 0) {
			newPasswordId = queueIds.passwordIdFree[0];	
			await queueRemover("passwordIdFree", 1);
		} else {
			newPasswordId = idsCounters.passwordIdC;
			// Update counter values
			let query = {passwordIdC: idsCounters.passwordIdC};
			query = {passwordIdC: idsCounters.passwordIdC};
			const updateIDC = {$set: {passwordIdC: idsCounters.passwordIdC + 1}};
			await pwmClient.db(DB_NAME).collection("users").updateOne(query, updateIDC);
		}
		// Collection Ids
		if (queueIds.collectionIdFree.length !== 0) {
			newCollectionId = queueIds.collectionIdFree[0];	
			await queueRemover("collectionIdFree", 1);
		} else {
			newCollectionId = idsCounters.collectionIdC;
			// Update counter values
			let query = {collectionIdC: idsCounters.collectionIdC};
			query = {collectionIdC: idsCounters.collectionIdC};
			const updateIDC = {$set: {collectionIdC: idsCounters.collectionIdC + 1}};
			await pwmClient.db(DB_NAME).collection("users").updateOne(query, updateIDC);
		}

		// OrderTable Ids
		if (queueIds.orderTableIdFree.length !== 0) {
			newOrderTableId = queueIds.orderTableIdFree[0];	
			await queueRemover("orderTableIdFree", 1);
		} else {
			newOrderTableId = idsCounters.orderTableIdC;
			// Update counter values
			let query = {orderTableIdC: idsCounters.orderTableIdC};
			query = {orderTableIdC: idsCounters.orderTableIdC};
			const updateIDC = {$set: {orderTableIdC: idsCounters.orderTableIdC + 1}};
			await pwmClient.db(DB_NAME).collection("users").updateOne(query, updateIDC);
		}

		const userData = {
			email: user.email.toLowerCase(),
			name: user.name,
			surname: user.surname,
			username: user.username,
			userID: newUserId,
			passwordId: newPasswordId,
			orderTableId: newOrderTableId,
			collectionId: newCollectionId,
			hP: hP,
			packs: packs,
			favoredHeroId: null,
			creationDate: new Date()
		};

		const passwordData = {
			password: user.password,
			passwordId: String(newPasswordId)
		}

		const collectionData = {
			collectionId: newCollectionId,
			cards: {}
		}

		const ordersTableData = {
			tableId: newOrderTableId,
			orders: []
		}
		const checkForEmail = await pwmClient.db(DB_NAME).collection("users").findOne({ email: user.email })

		if (! await getUsersById(newUserId) && ! checkForEmail) {
			const newUser = await pwmClient.db(DB_NAME).collection("users").insertOne(userData);
			await pwmClient.db(DB_NAME).collection("password").insertOne(passwordData);
			await pwmClient.db(DB_NAME).collection("collections").insertOne(collectionData);
			await pwmClient.db(DB_NAME).collection("ordersTable").insertOne(ordersTableData);
			console.log(`New user added successfully: ${newUser}`);
			console.log(`\x1b[32mSuccess:\x1b[0m User, -{${newUserId}}- registration was a success!\n`);
			res.json({ id: newUserId });
		} else {
			console.log(`\x1b[33mWarning:\x1b[0m User, with userId:(-{${newUserId}}-) or mail(${user.mail}) already exist in DB\n`);
			res.status(409).json({ error: `User with id: ${newUserId} ora email: ${user.email} already exist!`});
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Spacchettamento route
app.post('/users/spacchettamento', async (req, res) => {
	/*#swagger.tags = ['Users']
	#swagger.summary = Pack Opening!
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/openPacks"
				}
			}
		}
	}*/
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);
			const type = req.body.type;

			const user = await pwmClient.db(DB_NAME).collection("users").findOne({userID: userId});
			if (!user) {
				console.log(`\x1b[33mWarning:\x1b[0m user, ${userId} was not found!`);
				return res.status(404).json({message: 'User not found' });
			}
			if (user.packs[type] > 0) {
				const removedPacks = await pwmClient.db(DB_NAME).collection("users").updateOne(
					{ userID: userId }, // imposto il filtro x trovare l0utente
					{ $inc: { [`packs.${type}`]: -1 } } // updato il valore
				);

				// Estraggo le carte per pack type
				let randomCards;
				randomCards = await pwmClient.db(DB_NAME).collection("cardInfo").aggregate([
					{ $sample: { size: 3 } }  // estraggo 3 per pacchetto 
				]).toArray();
				if (type === "common") {
					const randomCard = await pwmClient.db(DB_NAME).collection("cardInfo").aggregate([
						{ $sample: { size: 1 } }
					]).toArray();
					console.log(`\x1b[32mSuccess:\x1b[0m User, -{${userId}}- has openend a ${type} packs:`);
					console.table(randomCard.concat(randomCards));
					randomCards = randomCards.concat(randomCard);
				} else if (type === "epic") {
					const randomEpic = await pwmClient.db(DB_NAME).collection("cardInfo").aggregate([
						{ $match: { cardId : { $gte: 301096, $lte: 301406 } } },
						{ $sample: { size: 1 } }
					]).toArray();
					if (randomEpic[0].rarity !== "epic") {
						console.log(`\x1b[33mWarning:\x1b[0m Wrong search: expected ${type}, found ${randomEpic.rarity}`);
					} else {
						console.log(`\x1b[32mSuccess:\x1b[0m User, -{${userId}}- has openend a ${type} packs:`);
						console.table(randomEpic.concat(randomCards));
						randomCards = randomCards.concat(randomEpic);
					}
				} else if (type === "legendary") {
					const randomLegendary = await pwmClient.db(DB_NAME).collection("cardInfo").aggregate([
						{ $match: { cardId : { $gte: 301407, $lte: 301563 } } },
						{ $sample: { size: 1 } }
					]).toArray();
					if (randomLegendary[0].rarity !== "legendary") {
						console.log(`\x1b[33mWarning:\x1b[0m Wrong search: expected ${type}, found ${randomLegendary.rarity}`);
					} else {
						console.log(`\x1b[32mSuccess:\x1b[0m User, -{${userId}}- has openend a ${type} packs:`);
						console.table(randomLegendary.concat(randomCards));
						randomCards = randomCards.concat(randomLegendary);
					}
				}

				// Inserisco nel db le carte by cardId
				for (const card of randomCards) {
					await pwmClient.db(DB_NAME).collection("collections").updateOne(
						{ collectionId: user.collectionId }, // Filtro per trovare la collezione
						{
							$inc: { [`cards.${card.cardId}`]: 1 } // Se esiste, incrementa di 1; se non esiste, viene creato e settato a 1
						},
						{ upsert: true } // Se la collezione non esiste, viene creata
					);
				}
				res.json({ cards: randomCards });
			} else {
				res.status(403).json({message: `Not enough ${type} Packs!` });
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Edit user profile info Route
app.put('/users/editProfile', async (req, res) => {
	/*#swagger.tags = ['Users']
	#swagger.summary = Edit user profile
		#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/userEditProfile"
				}
			}
		}
	}*/

	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const data = req.body;
			const userCookie = req.headers.cookie;
			const userId = parseInt(userCookie.split("!")[1]);
			//console.log(data);
			if ("password" in data) {
				const user = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: userId });
				if (user) {
					const passwordUpdate = await pwmClient.db(DB_NAME).collection("password").updateOne(
						{ passwordId: String(user.passwordId) }, // imposto il filtro x trovare l0utente
						{ $set: { password: data.password } } // updato il valore
					);
					if (!passwordUpdate) {
						console.log(`\x1b[33mWarning:\x1b[0m No password were found with PasswordId, ${user.passwordId}`);
						return res.status(404).json({ error: `No password were found` });
					} else if (passwordUpdate.modifiedCount === 0) {
						console.log(`\x1b[33mWarning:\x1b[0m Password were not updated`);
						return res.status(404).json({ error: `Password were not updated` });
					}
				}
				// rimuovo per nn creare problemi con altri oggetti se da add
				delete data.password;
			}
			if ("email" in data || "name" in data || "surname" in data || "username" in data || "favoredHeroId" in data) {
				// Apdato resto delle user info
				const responseUpdate = await pwmClient.db(DB_NAME).collection("users").updateOne(
					{ userID: parseInt(userId) }, // imposto il filtro x trovare l0utente
					{ $set: data } // updato il valore
				);

				// Response per removed Hp
				if (responseUpdate.matchedCount === 0) {
					console.log(`\x1b[33mWarning:\x1b[0m No user were found with id, -{${userId}}-`);
					return res.status(404).json({ error: `No user were found with userId: ${userId}` });
				} else if (responseUpdate.modifiedCount === 0) {
					console.log(`\x1b[33mWarning:\x1b[0m No documents were updated, same date sended!`);
					return res.status(409).json({ error: `No documents were updated, same data sended` });
				}
			}

			console.log(`\x1b[32mSuccess:\x1b[0m user, -{${userId}}- personal info updated successfully!`);
			res.status(200).json(`User data has been successfully updated!`);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Delete User Route
app.delete('/users/delete', async (req, res) => {
	// #swagger.tags = ['Users']
	// #swagger.summary = Delete a User PERMANENTLY!
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userCookie = req.headers.cookie;
			const userId = userCookie.split("!")[1];
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: parseInt(userId) });
			if (!user) {
				console.log(`\x1b[33mWarning:\x1b[0m user -{${userId}}- was not found!`);
				return res.status(404).json({message: 'User not found' });
			}

			// Add per ogni categoria alle rispettive free list
			await queueAdder("passwordIdFree", user.passwordId);
			await queueAdder("collectionIdFree", user.collectionId);
			await queueAdder("orderTableIdFree", user.orderTableId);
			await queueAdder("userIdFree", parseInt(userId));

			const ordersTable = await pwmClient.db(DB_NAME).collection("ordersTable").findOne({ tableId: user.orderTableId });
			if (!ordersTable) {
				console.log(`\x1b[33mWarning:\x1b[0m ordersTable -{${user.orderTableId}}- was not found!`);
				return res.status(404).json({message: 'OrdersTable not found' });
			}

			const orders = ordersTable.orders;
			for (let i = 0; i < orders.length; i++) {
				await queueAdder("orderIdFree", orders[i]);
			}

			const passwordDeletion = await pwmClient.db(DB_NAME).collection("password").deleteOne({ passwordId: String(user.passwordId) });
			if (passwordDeletion.deletedCount !== 1) {
				console.log(`\x1b[33mWarning:\x1b[0m Password deletion failed for ID: ${user.passwordId}`);
				return res.status(409).json({message: 'Password deletion failed' });
			}
			console.log(`\x1b[35mDebug:\x1b[0m Password deletion completed for ID: ${user.passwordId}`);

			// Collection coll deletion
			const collectionDeletion = await pwmClient.db(DB_NAME).collection("collections").deleteOne({ collectionId: user.collectionId });
			if (collectionDeletion.deletedCount !== 1) {
				console.log(`\x1b[33mWarning:\x1b[0m Collection deletion failed for ID: ${user.collectionId}`);
				return res.status(409).json({message: 'Collection deletion failed' });
			}
			console.log(`\x1b[35mDebug:\x1b[0m Collection deletion compled for ID: ${user.collectionId}`);

			// OrdersTable coll deletion
			const ordersTableDeletion = await pwmClient.db(DB_NAME).collection("ordersTable").deleteOne({ tableId: user.orderTableId });
			if (ordersTableDeletion.deletedCount !== 1) {
				console.log(`\x1b[33mWarning:\x1b[0m OrdersTable deletion failed for ID: ${user.orderTableId}`);
				return res.status(409).json({message: 'OrdersTable deletion failed' });
			}
			console.log(`\x1b[35mDebug:\x1b[0m OrdersTable deletion completed for ID: ${user.orderTableId}`);

			if (orders.length !== 0) {
				// Orders coll deletion
				const ordersDeletion = await pwmClient.db(DB_NAME).collection("orders").deleteMany({ orderTId: user.orderTableId });
				if (ordersDeletion.deletedCount === 0) {
					console.log(`\x1b[33mWarning:\x1b[0m No orders were deleted for OrderTable ID: ${user.orderTableId}`);
					return res.status(409).json({message: 'Orders deletion failed' });
				}
				console.log(`\x1b[35mDebug:\x1b[0m orders were deleted for OrderTable ID: ${user.orderTableId}`);
			} else {
				console.log(`\x1b[35mDebug:\x1b[0m No orders were deleted for OrderTable ID: ${user.orderTableId}, because length 0`);
			}

			// User coll deletion
			const userDeletion = await pwmClient.db(DB_NAME).collection("users").deleteOne({ userID: parseInt(userId) });
			// Check se user è stato effettivamente eliminato
			if (userDeletion.deletedCount !== 1) {
				console.log(`\x1b[35mError:\x1b[0m User deletion failed for ID: ${userId}`);
				return res.status(409).json({message: 'User deletion failed' });
			}

			// Cookie deletion
			const userCookieName = userCookie.split("!")[0].split("=")[1];
			generatedCookies.delete(userCookieName);
			console.log(`\x1b[35mDebug:\x1b[0m User Cookie removed for userId: -{${userId}}- `);
			res.setHeader('Set-Cookie', `token=${userCookieName}; Max-Age=0; Path=/`);
			res.status(200).json(`User deleted compleatly succesfully, with userId: ${userId}`);

			console.log(`\x1b[32mSuccess:\x1b[0m user -{${userId}}- account deleted successfully!`);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Check for sufficient Hp Route
app.get('/buy/enoughHp/:price', async (req, res) => {
	/*#swagger.auto = false
	#swagger.tags = ['Buy']
	#swagger.summary = Check if user can afford a transaction
	#swagger.consumes = ['application/json']
   	#swagger.parameters['price'] = {
		in: 'path',
		description: 'Quantity to be checked',
		required: true,
		type: 'integer',
		example: 25,
   	}*/
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({userID: parseInt(userId)});
			const price = parseInt(req.params.price);
			//console.warn(price)
			if (!user) {
				console.log(`\x1b[33mWarning:\x1b[0m user, -{${userId}}- was not found!`);
				return res.status(404).json({message: 'User not found' });
			}

			if (user.hP >= price) {
				// Restituisce true se ha abbastanza Hp
				return res.json({ success: true, message: 'Sufficient Hp' });
			} else {
				// Restituisce false se non ha abbastanza Hp
				console.log(`\x1b[33mWarning:\x1b[0m user, -{${userId}}- hasn't enough Hp to buy a pack -> U: ${user.hP}<${price} :Needed`);
				return res.json({ success: false, message: 'Not enough Hp' });
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Buy Hp from shop Route
app.put('/buy/hp', async (req, res) => {
	/*#swagger.tags = ['Buy']
	#swagger.summary = buy some Hp
 	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/buyHp"
				}
			}
		}
	}*/

	try {
		//console.log(req.body);
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);
			const result = await pwmClient.db(DB_NAME).collection("users").updateOne(
				{ userID: parseInt(userId) }, // imposto il filtro x trovare l0utente
				{ $inc: { hP: + req.body.quantity } } // updato il valore
			);

			if (result.matchedCount === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m No user were found with id: -{${userId}}-`);
				res.status(404).json({ error: `No user were found with userId: ${userId}` });
			} else if (result.modifiedCount === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m No documents were updated!`);
				res.status(404).json({ error: `No documents were updated` });
			} else {
				console.log(`\x1b[32mSuccess:\x1b[0m ${req.body.quantity} Hp added to user -{${userId}}- account!`);
				res.status(200).json(`Hp has been successfully added to user account`);
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Buy Packs from shop Route
app.put('/buy/packs', async (req, res) => {
	/*#swagger.tags = ['Buy']
	#swagger.summary = Buy some packs
 	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/buyPacks"
				}
			}
		}
	}*/

	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({userID: parseInt(userId)});
			if (!user) {
				console.log(`\x1b[33mWarning:\x1b[0m user, -{${userId}}- was not found!`);
				return res.status(404).json({message: 'User not found' });
			}
			//console.warn(user.hP, req.body.removeHp)
			// Check per hP
			if (!req.body.removeHp) {
				console.log(`\x1b[33mWarning:\x1b[0m Not enough parameters in request!`);
				return res.status(403).json({message: 'Not enough parameters in request' });
			}
			if (user.hP < req.body.removeHp) {
				console.log(`\x1b[33mWarning:\x1b[0m Not enough Hp!`);
				return res.status(403).json({message: 'Not onough Hp' });
			}
			// Apdato Packs
			const addedPacks = await pwmClient.db(DB_NAME).collection("users").updateOne(
				{ userID: parseInt(userId) }, // imposto il filtro x trovare l0utente
				{ $inc: { [`packs.${req.body.type}`]: parseInt(req.body.quantity) } } // updato il valore
			);
			// Rimuovo Hp
			const removedHp = await pwmClient.db(DB_NAME).collection("users").updateOne(
				{ userID: parseInt(userId) }, // imposto il filtro x trovare l0utente
				{ $inc: { hP: - req.body.removeHp } } // updato il valore
			);

			// Response per removed Hp
			if (addedPacks.matchedCount === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m No user were found with id: -{${userId}}-`);
				res.status(404).json({ error: `No user were found with userId: ${userId}` });
			} else if (addedPacks.modifiedCount === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m No documents for packs were updated!`);
				res.status(404).json({ error: `No documents were updated` });
			} else {
				console.log(`\x1b[32mSuccess:\x1b[0m ${req.body.quantity} ${req.body.type} Packs added to user -{${userId}}- account!`);
				res.status(200).json(`Hp has been successfully added to user account`);
			}

			// Response per added Packs
			if (removedHp.matchedCount === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m No user were found with id: -{${userId}}-`);
				res.status(404).json({ error: `No user were found with userId: ${userId}` });
			} else if (removedHp.modifiedCount === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m No documents for Hp were updated!`);
				res.status(404).json({ error: `No documents were updated` });
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// get User Orders Route
app.get('/orders/getUserOrders', async (req, res) => {
	// #swagger.tags = ['Orders']
	// #swagger.summary = Get user Orders from his account
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);

			// 1. Trova il `orderTableId` per lo `userId` specificato
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: userId });
			if (!user || !user.orderTableId) {
				return res.status(404).json({ error: 'User or orderTableId not found' });
			}

			const orderTableId = user.orderTableId;

			// 2. Trova la tabella degli ordini per `tableId`
			const orderTable = await pwmClient.db(DB_NAME).collection("ordersTable").findOne({ tableId: orderTableId });
			if (!orderTable || !orderTable.orders) {
				return res.status(404).json({ error: 'Order table not found' });
			}

			const orderIds = orderTable.orders;

			// Trova gli ordini 
			const orders = await pwmClient.db(DB_NAME).collection("orders")
				.find({ orderId: { $in: orderIds } })
				.sort({ createdAt: -1, cardId: -1 })  // Ordina per `createdAt` e `cardId` in ordine decrescente
				.toArray();

			const totalDocuments = orderTable.orders.length;

			// Controlla se ci sono ordini
			if (!orders || orders.length === 0) {
				console.log(`\x1b[33mWarning:\x1b[0m no orders were found!`);
				return res.status(204).json({ message: 'no orders were found' });
			} else {
				console.log(`\x1b[35mDebug:\x1b[0m ${orders.length} orders extracted successfully!`);
				res.json({ totalDocuments, orders });
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Get orders Route
app.post('/orders/getOrders', async (req, res) => {
	/*#swagger.tags = ['Orders']
	#swagger.summary = Get 1 or many orders with ordersId 
 	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/getOrders"
				}
			}
		}
	}*/

	try {
		let offset = req.body.offset || 0;
		const cardIdsArray = req.body.search;
		let limitValue = Infinity;
		if (req.body.limit) {
			limitValue = req.body.limit;
		}
		const skipValue = offset;

		let totalDocuments;
		let orders;

		if (!offset && !cardIdsArray) {
			console.log(`\x1b[33mWarning:\x1b[0m bad request: no parameters in request`);
			return res.status(400).json({ message: 'no parameters in request' });
		}

		// Verifica se il campo `search` è presente e ha elementi
		if (!cardIdsArray || cardIdsArray.length === 0) {
			totalDocuments = await pwmClient.db(DB_NAME).collection("orders").countDocuments({});
			orders = await pwmClient.db(DB_NAME).collection("orders")
				.find({})
				.sort({ createdAt: -1, cardId: -1 })  // Ordina per `createdAt` e `cardId` in ordine decrescente
				.skip(skipValue)
				.limit(limitValue)
				.toArray();
		} else {
			if (!Array.isArray(cardIdsArray)) {
				console.log(`\x1b[33mWarning:\x1b[0m bad request: search param must be an array`);
				return res.status(400).json({ message: 'search param must be an array' });
			}
			if (!cardIdsArray.every(item => Number.isInteger(item))) {
				console.log(`\x1b[33mWarning:\x1b[0m bad request: search param array must contains all integers`);
				return res.status(400).json({ message: 'search param array must contains all integers' });
			}

			totalDocuments = await pwmClient.db(DB_NAME).collection("orders").countDocuments({ cardId: { $in: cardIdsArray } });
			orders = await pwmClient.db(DB_NAME).collection("orders")
				.find({ cardId: { $in: cardIdsArray } })
				.sort({ createdAt: -1, cardId: -1 })  // Ordina per `createdAt` e `cardId` in ordine decrescente
				.skip(skipValue)
				.limit(limitValue)
				.toArray();
		}

		// Controlla se ci sono ordini
		if (!orders || orders.length === 0) {
			console.log(`\x1b[33mWarning:\x1b[0m no orders were found!`);
			return res.status(204).json({ message: 'no orders were found' });
		} else {
			console.log(`\x1b[35mDebug:\x1b[0m ${orders.length} orders extracted successfully!`);
			res.json({ totalDocuments, orders });
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Place Order Route
app.post('/orders/placeOrder', async (req, res) => {
	/*#swagger.tags = ['Orders']
	#swagger.summary = Place an order on the marketplace
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/placeOrder"
				}
			}
		}
	}*/

	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);

			const taxedPrice = Math.ceil(req.body.price + (req.body.price * 0.07));
			const quantity = req.body.quantity;
			const cardId = req.body.cardId;

			// 1. Trova il `orderTableId` per lo `userId` specificato
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: userId });
			if (!user || !user.orderTableId) {
				return res.status(404).json({ error: 'User or orderTableId not found' });
			}
			const orderTableId = user.orderTableId;
			const collectionId = user.collectionId;

			//Extract new Order Id
			let newOrderId;
			const queueIds = await getUsersById("0");	
			const idsCounters = await getUsersById("1");	
			if (queueIds.orderIdFree.length !== 0) {
				newOrderId = queueIds.orderIdFree[0];	
				await queueRemover("orderIdFree", 1);
			} else {
				newOrderId = idsCounters.orderIdC;
				// Update counter values
				let query = {orderIdC: idsCounters.orderIdC};
				query = {orderIdC: idsCounters.orderIdC};
				const updateIDC = {$set: {orderIdC: idsCounters.orderIdC + 1}};
				await pwmClient.db(DB_NAME).collection("users").updateOne(query, updateIDC);
			}
			newOrderId = parseInt(newOrderId);

			// Insert del nuovo ordine
			const result = await pwmClient.db(DB_NAME).collection("orders").insertOne({
				orderId: newOrderId,
				orderTId: orderTableId,
				cardId: cardId,
				price: taxedPrice,
				quantity: quantity
			});
			// Check x ordine andato a buon fine
			if (result.insertedId) {
				console.log(`\x1b[35mDebug:\x1b[0m new order has been inserted successfully with orderId: ${newOrderId}`);
			} else {
				console.log(`\x1b[33mWarning:\x1b[0m Order insertion failed!`);
				return res.status(409).json({ error: `Order insertion failed` });
			}

			// Update della collection
			const collection = await pwmClient.db(DB_NAME).collection("collections").findOne({ collectionId: collectionId });
			if (collection && collection.cards[cardId]) {
				const newQuantity = collection.cards[cardId] - quantity;
				if (newQuantity > 0) {
					await pwmClient.db(DB_NAME).collection("collections").updateOne(
						{ collectionId: collectionId },
						{ $set: { [`cards.${cardId}`]: newQuantity } }
					);
					console.log(`\x1b[35mDebug:\x1b[0m Card ${cardId} quantity updated to ${newQuantity} successfully!`);
				} else {
					await pwmClient.db(DB_NAME).collection("collections").updateOne(
						{ collectionId: collectionId },
						{ $unset: { [`cards.${cardId}`]: "" } }
					);
					console.log(`\x1b[35mDebug:\x1b[0m Card ${cardId} removed from the collection successfully!`);
				}
			} else {
				console.log(`\x1b[33mWarning:\x1b[0m Card not found or collection does not exist!`);
				return res.status(404).json({ error: `Card not found or collection does not exist` });
			}

			// Update ordersTable
			const ordersTableUpdate = await pwmClient.db(DB_NAME).collection("ordersTable").updateOne(
			{ tableId: orderTableId },
			{ $push: { orders: newOrderId } }
			);
			if (!ordersTableUpdate) {
				console.log(`\x1b[33mWarning:\x1b[0m Failed to update ordersTable!`);
                return res.status(500).json({ error: 'Failed to update ordersTable' });
			}

			console.log(`\x1b[32mSuccess:\x1b[0m New order has been placed correctly!`);
			res.status(200).json(`New order has been placed correctly!`);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Buy Order Route
app.put('/orders/buyOrder', async (req, res) => {
	/*#swagger.tags = ['Orders']
	#swagger.summary = Buy an order from marketplace
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/buyOrder"
				}
			}
		}
	}*/

    try {
        const check = cookieChecking(res, req.headers.cookie);
        if (check === true) {
            const userId = parseInt(req.headers.cookie.split("!")[1]);

            // Get Vendor
            const itemQuantity = req.body.itemQuantity;
            const orderId = req.body.orderId;

            const order = await pwmClient.db(DB_NAME).collection("orders").findOne({ orderId: orderId });
            if (!order) {
				console.log(`\x1b[33mWarning:\x1b[0m Order not found!`);
                return res.status(404).json({ error: 'Order not found' });
            }

            // Get Acquirent
            const userAcquirent = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: parseInt(userId) });
            if (!userAcquirent) {
				console.log(`\x1b[33mWarning:\x1b[0m User not found!`);
                return res.status(404).json({ error: 'User not found' });
            }

			// check per enough
			if (order.price > userAcquirent.hP) {
				console.log(`\x1b[35mDebug:\x1b[0m User hasn't enough Hp!`);
                return res.status(403).json({ error: "User hasn't enough Hp" });
			}

			// get user vendor
            const vendorTId = order.orderTId;
            const userVendor = await pwmClient.db(DB_NAME).collection("users").findOne({ orderTableId: vendorTId });
            if (!userVendor) {
				console.log(`\x1b[33mWarning:\x1b[0m User or orders table not found!`);
                return res.status(404).json({ error: 'User or orders table not found' });
            }

            // Calculate initial price removing 7%
            let initialPrice = order.price / 1.07;
            initialPrice = Math.floor(initialPrice);

            // Add Hp to Vendor
            let result = await pwmClient.db(DB_NAME).collection("users").updateOne(
                { userID: parseInt(userVendor.userID) },
                { $inc: { hP: + (initialPrice * itemQuantity) } }
            );
            if (!result.matchedCount || !result.modifiedCount) {
				console.log(`\x1b[33mWarning:\x1b[0m Failed to update vendor's HP!`);
                return res.status(500).json({ error: 'Failed to update vendor' });
            }

            // Update/delete order
            if (itemQuantity >= order.quantity) {
                // Delete order
                result = await pwmClient.db(DB_NAME).collection("orders").deleteOne({ orderId: parseInt(order.orderId) });
                if (result.deletedCount === 1) {
                    queueAdder("orderIdFree", order.orderId);
					console.log(`\x1b[35mDebug:\x1b[0m Order ${order.orderId} successfully deleted!`);
                } else {
					console.log(`\x1b[33mWarning:\x1b[0m Order not found for deletion!`);
                    return res.status(404).json({ error: 'Order not found for deletion' });
                }
            } else {
                // Update order
                const newOrderQuantity = order.quantity - itemQuantity;
                result = await pwmClient.db(DB_NAME).collection("orders").updateOne(
                    { orderId: order.orderId },
                    { $set: { "quantity": newOrderQuantity } }
                );
                if (!result.matchedCount || !result.modifiedCount) {
					console.log(`\x1b[33mWarning:\x1b[0m Failed to update order quantity!`);
                    return res.status(500).json({ error: 'Failed to update order' });
                }
                console.log(`\x1b[35mDebug:\x1b[0m Order ${order.orderId} quantity updated to ${newOrderQuantity} successfully!`);
            }

            const collectionId = userAcquirent.collectionId;

            // Update user Hp
            const newQuantity = - (order.price * itemQuantity);
            const hpUpdateRes = await pwmClient.db(DB_NAME).collection("users").updateOne(
                { userID: userId },
                { $inc: { "hP": newQuantity } }
            );
            if (!hpUpdateRes.matchedCount || !hpUpdateRes.modifiedCount) {
				console.log(`\x1b[33mWarning:\x1b[0m Failed to update user HP!`);
                return res.status(500).json({ error: 'Failed to update user HP' });
            }

            // Update user Collection
            const collUpdateRes = await pwmClient.db(DB_NAME).collection("collections").updateOne(
                { collectionId: collectionId },
                { $inc: { [`cards.${order.cardId}`]: itemQuantity } }
            );
            if (!collUpdateRes.matchedCount || !collUpdateRes.modifiedCount) {
				console.log(`\x1b[33mWarning:\x1b[0m Failed to update user collection!`);
                return res.status(500).json({ error: 'Failed to update collection' });
            }

            console.log(`\x1b[32mSuccess:\x1b[0m Transaction was successful!`);
            res.status(200).json(`Transaction was successful!`);
        }
    } catch (error) {
        console.error(`\x1b[31mError:\x1b[0m`, error);
        res.status(500).json({ message: 'Error', error });
    }
});

// Delete Order Route
app.delete('/orders/deleteOrder', async (req, res) => {
	/*#swagger.tags = ['Orders']
	#swagger.summary = delete a User order with orderId
	#swagger.consumes = ['application/json']
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/deleteOrder"
				}
			}
		}
	}*/

    try {
        const check = cookieChecking(res, req.headers.cookie);
        if (check === true) {
            const userId = parseInt(req.headers.cookie.split("!")[1]);

            // Get Vendor
            const orderId = req.body.orderId;

            const order = await pwmClient.db(DB_NAME).collection("orders").findOne({ orderId: orderId });
            if (!order) {
				console.log(`\x1b[33mWarning:\x1b[0m Order not found!`);
                return res.status(404).json({ error: 'Order not found' });
            }

			// get user
            const user = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: parseInt(userId) });
            if (!user) {
				console.log(`\x1b[33mWarning:\x1b[0m User or orders table not found!`);
                return res.status(404).json({ error: 'User or orders table not found' });
            }

			// Delete order
			result = await pwmClient.db(DB_NAME).collection("orders").deleteOne({ orderId: parseInt(order.orderId) });
			if (result.deletedCount === 1) {
				queueAdder("orderIdFree", order.orderId);
				console.log(`\x1b[35mDebug:\x1b[0m Order ${order.orderId} successfully deleted!`);
			} else {
				console.log(`\x1b[33mWarning:\x1b[0m Order not found for deletion!`);
				return res.status(404).json({ error: 'Order not found for deletion' });
			}

            const collectionId = user.collectionId;

            // Update user Collection
            const collUpdateRes = await pwmClient.db(DB_NAME).collection("collections").updateOne(
                { collectionId: collectionId },
                { $inc: { [`cards.${order.cardId}`]: order.quantity } }
            );
            if (!collUpdateRes.matchedCount || !collUpdateRes.modifiedCount) {
				console.log(`\x1b[33mWarning:\x1b[0m Failed to update user collection!`);
                return res.status(500).json({ error: 'Failed to update collection' });
            }

            console.log(`\x1b[32mSuccess:\x1b[0m Order deletion was successful!`);
            res.status(200).json(`Order deletion was successful!`);
        }
    } catch (error) {
        console.error(`\x1b[31mError:\x1b[0m`, error);
        res.status(500).json({ message: 'Error', error });
    }
});

// Get collection by UserId Route
app.get('/collection/getCollection', async (req, res) => {
	// #swagger.tags = ['Misc']
	// #swagger.summary = Get a user Collection
	try {
		const check = cookieChecking(res, req.headers.cookie);
		if (check === true) {
			const userId = parseInt(req.headers.cookie.split("!")[1]);
			const user = await pwmClient.db(DB_NAME).collection("users").findOne({userID: userId});
			if (!user) {
				console.log(`\x1b[33mWarning:\x1b[0m user -{${userId}}- was not found!`);
				return res.status(404).json({message: 'User not found' });
			}
			const collection = await pwmClient.db(DB_NAME).collection("collections").findOne({collectionId: user.collectionId});
			if (!collection) {
				console.log(`\x1b[33mWarning:\x1b[0m collection ${user.collectionId} was not found!`);
				return res.status(404).json({message: 'Collection not found' });
			}
			const numberOfCards = Object.keys(collection.cards).length;
			if (numberOfCards === 0) {
				console.log(`\x1b[35mDebug:\x1b[0m collection ${user.collectionId} is empty!`);
				return res.status(204).json({message: 'Collection empty' });
			}
			console.log(`\x1b[35mDebug:\x1b[0m collection ${user.collectionId} extracted successfully!`);
			res.json(collection.cards);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// Get cards data by cardId/marvelId list Route
app.post('/cards/getCards', async (req, res) => {
	/*#swagger.tags = ['Misc']
	#swagger.summary = Get a card details
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/getCards"
				}
			}
		}
	}*/

	try {
		const cardIds = req.body.cards;
		const cards = await pwmClient.db(DB_NAME).collection("cardInfo").find({ [req.body.searchParam]: { $in: cardIds } }).toArray();
		if (!cards || cards.length === 0) {
			console.log(`\x1b[33mWarning:\x1b[0m card -{${cards}}- was not found!`);
			return res.status(404).json({message: 'cards not found' });
		} else {
			console.log(`\x1b[35mDebug:\x1b[0m ${cards.length} cards extracted successfully!`);
			res.json(cards);
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});

// SuperUser access Route
app.get('/sU/getUserAccess/:userId', async (req, res) => {
	/*#swagger.tags = ['SuperUser']
	#swagger.summary = Log a superUser into an another user
	#swagger.consumes = ['application/json']
   	#swagger.parameters['userId'] = {
		in: 'path',
		description: 'ID of the user to log into',
		required: true,
		type: 'string',
		example: '100001',
	}*/
	try {
		const check = cookieChecking(res, req.headers.cookie);
		//console.warn(check);
		if (check === true) {
            const userId = parseInt(req.headers.cookie.split("!")[1]);
			if (userId === 100000) {
				const newUserId = parseInt(req.params.userId);
				//console.warn(newUserId)
				if (newUserId) {
					// get user
					const user = await pwmClient.db(DB_NAME).collection("users").findOne({ userID: parseInt(newUserId) });
					if (!user) {
						console.log(`\x1b[33mWarning:\x1b[0m User or orders table not found!`);
						return res.status(404).json({ error: 'User or orders table not found' });
					}

					// creo i dati x il cookie
					const expires = new Date(Date.now() + 1000 * 60 * 60 * 8);
					expires.setMilliseconds(0);
					const tokenValue = Math.random().toString(36).substr(2);
					// Creo il cookie da mandare in risposta
					res.setHeader("Set-Cookie", [
						`token=${tokenValue}!${newUserId}; Expires=${expires.toUTCString()}; Path=/`,
					]);

					// Aggiungo il cookie alla mia mappa nel server
					const newCookie = { userId: String(newUserId), cookieValue: tokenValue, expireDate: expires};
					addToMap(generatedCookies , newCookie);
					if (generatedCookies.get(tokenValue)) {
						console.log('\x1b[35mDebug:\x1b[0m GeneratedCookies Map, Successfully updated!');
						//console.table([...generatedCookies]);
					} else {
						console.log('\x1b[35mDebug:\x1b[0m during GeneratedCookies map update!');
						console.table([...generatedCookies]);
					}

					console.log(`\x1b[32mSuccess:\x1b[0m SuperUser has logged has user: -{${newUserId}}- successfully!`);
					res.status(200).json(`SuperUser has logged has user successfully!`);
				} else {
					console.log(`\x1b[33mWarning:\x1b[0m No userId passed from request!`);
					return res.status(400).json({ error: 'No userId passed from request!' });
				}
			} else {
				console.log(`\x1b[33mWarning:\x1b[0m User -{${userId}}- is not a superUser!`);
				return res.status(401).json({ error: 'You haven\'t superUser privileges!' });
			}
		}
	} catch (error) {
		console.error(`\x1b[31mError:\x1b[0m`, error);
		res.status(500).json({ message: 'Error', error });
	}
});
