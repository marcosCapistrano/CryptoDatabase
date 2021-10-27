import Axios from 'axios';

const ID_MAP_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map';
const QUOTES_LATEST_URL =
  'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
const headers = {
  'X-CMC_PRO_API_KEY': 'bf638232-518c-4217-8806-8788e792109a'
};

// const response = Axios.get(`${QUOTES_LATEST_URL}?id=1`, {headers}).then(response => console.log(response.data.data['1'].quote))

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CryptoData = {
  id: number;
  name: string;
  symbol: string;
};

async function updatePrice(ids: number[]) {
	const newIds = ids.map(id => id.toString().replace(",", ""));
	// console.log(newIds);

  // console.log(`${QUOTES_LATEST_URL}?id=${newIds.toLocaleString()}`);

  try {
    const values = await Axios.get(`${QUOTES_LATEST_URL}?id=${newIds.toLocaleString()}`, {
      headers
    });

			// console.log(values.data.data)
			// console.log(values.data)
    for (let id of newIds) {
			const value = values.data.data[id];
			// console.log("TESTANDO id", id)
			console.log("Atualizando: ", value.name)
			// console.log("id", value.id)
      await prisma.quote.create({
        data: {
          cryptocurrency_id: value.id,
          circulating_supply: value.circulating_supply,
          total_supply: value.total_supply,
          price: value.quote['USD'].price,
          volume24h: value.quote['USD'].volume_24h,
          market_cap: value.quote['USD'].market_cap,
					timestamp: new Date(value.last_updated),
        }
      });
    }
  } catch (err) {
		console.log("err")
    console.log(err);
  }
}

async function main() {
  // Connect the client
  await prisma.$connect();
  const response = await Axios.get(ID_MAP_URL, { headers });
  let allCryptos: Array<CryptoData> = response.data.data;
  let counter = 0;

  console.log('Updating crypto map, checking for new cryptos');
  for (let crypto of allCryptos) {
    console.log('Trying: ', crypto.name);
    let existingCrypto = await prisma.cryptocurrency.findFirst({
      where: { id: crypto.id }
    });

    if (!existingCrypto) {
      console.log('Trying to create: ', crypto.name);
      existingCrypto = await prisma.cryptocurrency.create({
        data: {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol
        }
      });
    }

    if (counter != 0 && counter % 100 == 0) {
      console.log('CHAMANDO');
      const ids = allCryptos.slice(counter - 100, counter).map(c => c.id);
      await updatePrice(ids);
    }
    console.log(counter % 100);
    counter++;
  }
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
