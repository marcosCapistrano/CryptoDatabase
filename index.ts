import Axios from 'axios';

const ID_MAP_URL="https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
const QUOTES_LATEST_URL="https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
const headers = {
	"X-CMC_PRO_API_KEY": "bf638232-518c-4217-8806-8788e792109a"
}

// const response = Axios.get(`${QUOTES_LATEST_URL}?id=1`, {headers}).then(response => console.log(response.data.data['1'].quote))

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type CryptoData = {
	id: number,
	name: string,
	symbol: string
}

async function main() {
  // Connect the client
  await prisma.$connect()
	const response = await Axios.get(ID_MAP_URL, {headers});
	const allCryptos: Array<CryptoData> = response.data.data;

	for(let crypto of allCryptos) {
		console.log("Trying to create: ", crypto.name);
		await prisma.cryptocurrency.create({
			data: {
				id: crypto.id,
				name: crypto.name,
				symbol: crypto.symbol
			}
		})
	}
	
  // ... you will write your Prisma Client queries here
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })