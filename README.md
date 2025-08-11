
# Техническое задание на разработку библиотеки-адаптера

<!-- TOC -->
* [Техническое задание на разработку библиотеки-адаптера](#техническое-задание-на-разработку-библиотеки-адаптера)
  * [Описание задачи](#описание-задачи)
  * [Технические особенности](#технические-особенности)
    * [Архитектура файлов](#архитектура-файлов-)
  * [Как библиотека будет использоваться](#как-библиотека-будет-использоваться-)
    * [Создание адреса](#создание-адреса)
    * [Билд транзакции](#билд-транзакции)
    * [Поллинг](#поллинг-)
  * [Разрешенные библиотеки](#разрешенные-библиотеки)
    * [Криптография](#криптография)
    * [Хэш-функции](#хэш-функции)
    * [Адреса и форматы данных](#адреса-и-форматы-данных)
    * [Блокчейн и смарт-контракты](#блокчейн-и-смарт-контракты)
    * [Другие библиотеки](#другие-библиотеки)
  * [Рекомендации по разработке](#рекомендации-по-разработке)
  * [Ограничения по сетевым запросам](#ограничения-по-сетевым-запросам)
    * [Методы, в которых нельзя выполнять сетевые запросы](#методы-в-которых-нельзя-выполнять-сетевые-запросы)
    * [Методы, в которых можно выполнять сетевые запросы, но через прокси](#методы-в-которых-можно-выполнять-сетевые-запросы-но-через-прокси)
<!-- TOC -->

## Описание задачи
Необходимо разработать библиотеку-адаптер для работы с блокчейном на основе предоставленного шаблона. Библиотека должна обладать следующими функциями:
- Создание адреса:
  - Генерация ключей и адреса.
  - Проверка валидности ключей и адреса.
- Отправка транзакции:
  - Сборка транзакции.
  - Подпись транзакции.
  - Отправка транзакции.
- Поллинг:
  - Получение информации о текущей высоте блокчейна.
  - Получение данных о блоке.
  - Получение информации о транзакции.
  - Получение баланса по адресу.


Запрещается использование сторонних библиотек, но можно использовать фрагменты кода при необходимости. В разделе "библиотеки" указаны одобренные, которые можно использовать. 

Нельзя изменять аргументы или выходные объекты методов, но можно добавлять дополнительные поля. 

Каждый метод имеет ограничения на использование сетевых запросов. Запрещено использование хранилищ, менеджеров состояния, баз данных и т.д.

Для вычислений с плавающей точной нельзя использовать Number или BigInt.  

_Если, кажется, что выполнение задачи в рамках данных ограничений невозможно, предложите свое решение с обоснованием._

---

## Технические особенности
- node.js = v18.16.0
- yarn = 1.22.19

### Архитектура файлов 
- 📂 src
  - 📂 constants* 
  - 📂 utils* 
  - 📂 libs* 
  - 📄 index.ts
  - 📄 coin.service.ts
  - 📄 node-adapter.ts
- 📂 test
  - 📄 coin.service.spec.ts
  - 📄 node-adapter.spec.ts
- 📄 .eslintrc.json
- 📄 tsconfig.build.json
- 📄 tsconfig.json
- 📄 package.json
- 📄 README.md
- 📄 .nvmrc
- 📄 .gitignore

_* Опционально._

---


## Как библиотека будет использоваться 
Библиотека встраивается в различные приложения которые заранее знают какие методы есть у этой библиотеки. 

Абстрактные примеры:

### Создание адреса
```typescript
const nodesOptions: NodesOptions = {
  '<providerName>': {
    url: '<url>',
    confirmationLimit: 10,
  },
};

const service: XxxCoinService = new XxxCoinService();

service.initNodes(nodesOptions);
const keysPair: AddressCreateResult = await service.addressCreate('xxx');
const isValidKeysPair: AddressValidateResult = await service.addressValidate('xxx', keysPair.address, keysPair.privateKey, keysPair.publicKey);
```

### Билд транзакции
```typescript
const nodesOptions: NodesOptions = {
  '<providerName>': {
    url: '<url>',
    confirmationLimit: 10,
  },
};

const service: XxxCoinService = new XxxCoinService();
service.initNodes(nodesOptions);

let params : XxxTransactionParams = {
  from: [
    {
      address: '<address_from>',
      value: '0.00005',
    },
  ],
  to: [
    {
      address: '<address_to>',
      value: '0.00005',
    },
  ],
  fee: {
    networkFee: 0.01,
    properties: {},
  },
};

const keyPair = {
  '<address>': '<private_key>'
}

params = await service.txBuild('xxx', params);
const txSign: TxSignResult = await service.txSign('xxx', keyPair, params);
const broadcast: XxxTransactionBroadcastResults | { error: string } = await service.nodes[0].txBroadcast('xxx', txSign);
```

### Поллинг 
```typescript
const nodesOptions: NodesOptions = {
  '<providerName>': {
    url: '<url>',
    confirmationLimit: 10,
  },
};

const service: XxxCoinService = new XxxCoinService();
service.initNodes(nodesOptions);


const height: AddressCreateResult = await service.getHeight();
const balance: AddressCreateResult = await service.balanceByAddress('xxx', '<address>');
const block: AddressCreateResult = await service.getBlock('xxx', '<block_number>');
const transaction: AddressCreateResult = await service.txByHash('xxx', '<transaction_hash>');
```
## Разрешенные библиотеки
### Криптография
- [elliptic](https://www.npmjs.com/package/elliptic) (v6.5.4): Библиотека для работы с эллиптическими кривыми, используемыми в криптографии. Предоставляет функции для генерации ключей, подписи и проверки подписей.
- [ethereumjs-tx](https://www.npmjs.com/package/@ethereumjs/tx) (v2.1.2): Библиотека для создания и обработки транзакций в сети Ethereum. Позволяет создавать и подписывать транзакции, а также проверять их подлинность.
- [ethereumjs-util](https://www.npmjs.com/package/ethereumjs-util) (v7.0.10): Библиотека с утилитами для работы с Ethereum. Включает функции для работы с адресами, преобразования данных и другие полезные инструменты.
- [secp256k1](https://www.npmjs.com/package/secp256k1) (v5.0.0): Библиотека для работы с криптографическим алгоритмом ECDSA на кривой secp256k1. Используется для создания и проверки электронных подписей.

### Хэш-функции
- [keccak](https://www.npmjs.com/package/keccak) (v3.0.1): Библиотека для вычисления хэш-функции Keccak. Часто используется в криптографии, включая блокчейн-технологии.
- [blakejs](https://www.npmjs.com/package/blakejs) (v1.1.1): Библиотека для вычисления хэш-функции Blake2b. Часто используется в криптографии и блокчейн-технологиях.

### Адреса и форматы данных
- [bech32](https://www.npmjs.com/package/bech32) (v2.0.0): Библиотека для работы с форматом адресов Bech32. Часто используется в криптовалютах, таких как Bitcoin и Litecoin.
- [base-x](https://www.npmjs.com/package/base-x) (v3.0.8): Библиотека для кодирования и декодирования данных в различные форматы, такие как Base58 и Base64. Часто используется для работы с адресами криптовалют.
- [bip32](https://www.npmjs.com/package/bip32) (v2.0.5): Библиотека для работы с иерархическими определениями ключей (BIP32). Позволяет создавать и управлять деревьями ключей для различных криптовалют.
- [bip39](https://www.npmjs.com/package/bip39) (v3.0.4): Библиотека для генерации мнемонических фраз (BIP39) и их преобразования в секретные ключи и адреса криптовалют.

### Блокчейн и смарт-контракты
- [axios](https://www.npmjs.com/package/axios) (v1.4.0): Библиотека для выполнения HTTP-запросов. Часто используется для взаимодействия с блокчейн-серверами и API криптовалют.
- [web3](https://www.npmjs.com/package/web3) (v3.0.0-rc.5): Библиотека для работы с Ethereum и другими блокчейнами. Предоставляет удобный интерфейс для взаимодействия с контрактами, отправки транзакций и получения данных из блокчейна.
- [osmojs](https://www.npmjs.com/package/osmojs) (v13.0.1): Библиотека для работы с Osmosis, блокчейн-платформой, основанной на Tendermint. Позволяет взаимодействовать с сетью Osmosis и выполнять операции, такие как создание аккаунтов и отправка транзакций.

### Другие библиотеки
- [big.js](https://www.npmjs.com/package/big.js) (v6.2.1): Библиотека для работы с большими числами с плавающей точкой. Часто используется в криптографии и финансовых приложениях.


_Не является полным списком, позднее будет дополнен_


## Рекомендации по разработке
- Используйте тестовый файл для быстрой проверки функций. 
```typescript
void (async function (): Promise<void> {
  // Пример как вызывать создание адреса
  const address = async (ticker: string): Promise<void> => {
    const address: AddressCreateResult = await service.addressCreate(ticker);
    console.log('Result address:', address);
  };
  
  // Высота
  const height = async (): Promise<void> => {
    const heightChain: number = await service.nodes[0].getHeight();
    console.log('Height:', heightChain);
  };

  // Транзакция
  const transaction = async (ticker: string, keyPair: AddressKeyPair, params: TransactionParams): Promise<void> => {
    const build: TransactionParams = await service.txBuild(ticker, params);
    const sign: TxSignResult = await service.txSign(ticker, keyPair, build);
    const broadcast: TransactionBroadcastResults | { error: string } = await service.nodes[0].txBroadcast(ticker, sign);
    console.log('Transaction:', broadcast);
  };


  // создание сервиса
  const service: XxxCoinService = new XxxCoinService();


  const params: TransactionParams = {
    from: [
      {
        address: '<address_from>',
        value: '0.00005',
      },
    ],
    to: [
      {
        address: '<address_to>',
        value: '0.00005',
      },
    ],
    fee: {
      networkFee: 0.01,
      properties: {},
    },
  };

  const keyPair = {
    '<address>': '<private_key>',
  };

  // конфиг провайдера
  const config: NodesOptions =
    {
      node: {
        url: '<url>',
        confirmationLimit: 10,
      },
    };

  // инициализация провайдера
  service.initNodes(config);

  try {
    // вызов функции создания адреса
    await address('xxx');
    
    // вызов функции получения высоты
    await height();
    
    // вызов функции отправки транзакции
    await transaction('xxx', keyPair, params);
  } catch (e) {
    console.error(e);
  }

  // для дебагера
  await new Promise(r => setTimeout(r, 60 * 1000));
}());
```
- Рекомендую начинать разработку с поллинга (`txByHash`, `getHeight`, `getBlock`, `balanceByAddress`), появится больше понимания как работает сам блокчейн. 
- Не нужно засиживаться над одной проблемой очень долго, либо отдохните, либо переключитесь на другую.

## Ограничения по сетевым запросам

### Методы, в которых нельзя выполнять сетевые запросы
- `addressCreate`
- `addressValidate`
- `txSign`

### Методы, в которых можно выполнять сетевые запросы, но через прокси
- `txBuild`

Пример с прокси
Задача: нам нужно в `txBuild` запросить у node все utxo по адресу. Но так как не можем на прямую запросить у node, выполняем через прокси. 
То есть **приложение1**, где выполняется функционал билда транзакции, вызывает функцию getUtxo, которая проксирует запрос на **приложение2**, где выполняется сам сетевой запрос. 
```typescript
export class XxxCoinService extends BaseCoinService {

  async txBuild(
          ticker: string,
          params: XxxTransactionParams,
  ): Promise<XxxTransactionParams> {
    // ...
    const uxto = await this.getUtxo(address);
    // ...
    return null;
  }

  // Функция которая выполняет запрос не в внешнему источнику, а к внутреннему, который в свою очередь уже выполняет запрос к внешнему источнику
  protected async getUtxo(
          address: string,
  ): Promise<UTXOParameters[]> {
    return axios
            .get<UtxoByAddressResponse>(
                    // env нигде прописывать не надо, просто считаем, что приложение которое будет запускать библиотеку имеет эти env
                    `${process.env['URL']}/utxo`,
                    {
                      params: {
                        network: this.network.toLowerCase(),
                        address,
                      },
                    },
            )
            .then((response: AxiosResponse<Record<'utxo', UTXOParameters[]>>) => response?.data?.utxo ?? null);
  }
}


export class XxxBlockBookAdapter extends BaseNodeAdapter {
  // ...
  public async utxoByAddress(
          ticker: string,
          address: string,
  ): Promise<UTXOParameters[]> {
    const rawUtxo: BlockBookUTXOParameters[] = await this.request(address);
    // ...
    // какая-то обработка   
    // ...
    return result;
  }
}
```
