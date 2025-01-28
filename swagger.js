const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        title: 'PWM-MarvelStars',
        description: 'Swagger for Marvel-Stars API'
    },
    host: 'localhost:3000',
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
			userLogin: {
				$email: "giugiust2002@gmail.com",
				$password: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
			},
			openPacks: {
				$type: "common",
			},
			userSignIn: {
				$email: "gianniCaproni1886@gmail.com",
				$password: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
				$name: "Gianni",
				$surname: "Caproni",
				$username: "gianniCaproni86",
			},
			userEditProfile: {
				email: "lorenzoSpinachi@hotmail.com",
				password: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
				name: "lorenzo",
				surname: "spinachi",
				username: "lorySpin99",
				favoredHeroId: 1009610,
			},
			buyHp: {
				$quantity: 100,
			},
			buyPacks: {
				$quantity: 1,
				$type: "common",
				$removeHp: 12,
			},
			getOrders: {
				search: [300001],
				offset: 0,
				limit: 0,
			},
			placeOrder: {
				$price: 25,
				$quantity: 1,
				$cardId: 300001,
			},
			buyOrder: {
				$orderId: 400001,
				$itemQuantity: 1,
			},
			deleteOrder: {
				$orderId: 400001,
			},
			getCards: {
				$searchParam: "cardId",
				$cards: [300001,300089],
			},
        }
    }
};

const outputFile = './swaggerOutput.json';
const routes = ['index.js'];

swaggerAutogen(outputFile, routes, doc);
