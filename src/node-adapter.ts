import {
  AdapterType,
  BalanceByAddressResult,
  BaseNodeAdapter,
  GetBlockResult,
  GetHeightResult,
  TxByHashResult,
  TxStatus,
} from './common';
import { XxxTransactionBroadcastParams, XxxTransactionBroadcastResults } from './types';
import { Transaction } from './common/index';

/**
 * Класс, который инициализируется в XxxCoinService для выполнения сетевых запросов.
 *
 * Вместо ХХХ указываем тикер.
 * BaseNodeAdapter - это базовый класс который определяет все методы и их типы.
 * @param network - короткое название сети.
 * @param name - Название провайдера, под которого пишется адаптер (NowNodes, GetBlock, Ankr  и тд).
 * @param confirmationLimit - Количество конфирмаций, число блоков которое отсчитывается после транзакции, чтобы считать ее завершенной.
 * @param utxoConfirmationLimit - Опциональное значение, используется только для сетей с utxo. Количество конфирмаций для utxo, число блоков которое отсчитывается после транзакции, чтобы считать ее завершенной.
 */
export class ZilNodeAdapter  extends BaseNodeAdapter {
  constructor(
    readonly network: string,
    readonly name: string = 'NN',
    readonly url: string,
    readonly confirmationLimit: number,
    readonly utxoConfirmationLimit?: number,
    readonly type = AdapterType.Node,
  ) {
    super();
  }

  /**
   * Функция, которая возвращается отформатированные данных по hash'у транзакции и тикеру.
   *
   * Стандартная реализация подразумевает сетевой запрос в сеть по hash'у и получение сырых данных из сети. Которые потом форматируются под ответ.
   * 1. Валидация по методу. В данной реализации поддерживаем только дефолтный метод трансфера. От сети к сети этот метод может отличаться, он может быть как дефолтный и заложен сетью, так и выполняться через специализированный контракт.
   * 2. Валидация по тикеру. Транзакции могут быть как токеновые, так и с нативной монетой. В данное реализации интересуют только транзакции нативной монеты.
   * 3. Валидация по статусу.
   *
   * Рекомендуется сделать дополнительный метод "processTransaction" который будет форматировать сырую транзакцию (не приведенную к общему типу) к формату который требуется на выходе TxByHashResult.
   * Если транзакция является batch-транзакцией (одна транзакция, где средства поступают на несколько адресов), то их необходимо разделить на разные транзакции с одним hash'ом.
   *
   * В случая если сеть не btc-like (нет utxo) и processTransaction вернул массив транзакций, то необходимо взять только первую транзакцию. Так как этот метод, в основном, важен только для получения статуса транзакции.
   */
  async txByHash(
  ticker: string,
  hash: string
): Promise<TxByHashResult> {
  const result = await this.request<any, any>(
    'POST',
    `${this.url}`,
    { id: 1, jsonrpc: '2.0', method: 'GetTransaction', params: [hash] },
    { 'api-key': process.env.NOWNODES_API_KEY }
  );
  // Здесь нужно преобразовать результат в TxByHashResult (from/to/status и т.д.)
  return {
  hash,
  ticker: 'ZIL',
  from: [{
    address: result.result.sender,
    value: String(result.result.amount || '0')
  }],
  to: [{
    address: result.result.toAddr,
    value: String(result.result.amount || '0')
  }],
  status: result.result.receipt?.success
    ? TxStatus.finished
    : result.result.receipt?.success === false
      ? TxStatus.failed
      : TxStatus.unknown,
  height: result.result.blockNumber
    ? Number(result.result.blockNumber)
    : undefined,
  data: result.result
};

}


  /**
   * Функция запроса высоты блокчейна.
   */
  async getHeight(): Promise<GetHeightResult> {
  const result = await this.request<{ result: string }, unknown>(
    'POST',
    `${this.url}`,
    { id: 1, jsonrpc: '2.0', method: 'GetBlockchainInfo', params: [] },
    { 'api-key': process.env.NOWNODES_API_KEY }
  );
  return Number(result.result);
}


  /**
   * Функция запроса блока и транзакций которые в этом блоке находятся по его высоте.
   */
  async getBlock(height: number): Promise<GetBlockResult> {
  const result = await this.request<any, any>(
    'POST',
    `${this.url}`,
    { id: 1, jsonrpc: '2.0', method: 'GetBlockByNum', params: [height, true] },
    { 'api-key': process.env.NOWNODES_API_KEY }
  );

  const transactions = (result.result.Transactions || []).map((tx: any) => ({
    hash: tx.ID || tx.hash,
    ticker: 'ZIL',
    from: [{
      address: tx.sender || tx.fromAddr || '',
      value: String(tx.amount || '0')
    }],
    to: [{
      address: tx.toAddr || '',
      value: String(tx.amount || '0')
    }],
    status: tx.receipt?.success
      ? TxStatus.finished
      : tx.receipt?.success === false
        ? TxStatus.failed
        : TxStatus.unknown,
    height,
    data: tx
  }));

  return {
    height,
    timestamp: new Date(result.result.header.Timestamp * 1000),
    transactions,
    data: result
  };
}



  /**
   * Функция запроса баланса по адресу и тикеру.
   */
  async balanceByAddress(
  ticker: string,
  address: string
): Promise<BalanceByAddressResult> {
  const result = await this.request<any, any>(
    'POST',
    `${this.url}`,
    { id: 1, jsonrpc: '2.0', method: 'GetBalance', params: [address] },
    { 'api-key': process.env.NOWNODES_API_KEY }
  );
  return {
    balance: result.result.balance,
    totalBalance: result.result.balance
  };
}


  /**
   * Функция отправки в сеть подписанной транзакции.
   */
  async txBroadcast(
  ticker: string,
  params: XxxTransactionBroadcastParams
): Promise<XxxTransactionBroadcastResults | { error: string }> {
  try {
    const result = await this.request<any, any>(
      'POST',
      `${this.url}`,
      { id: 1, jsonrpc: '2.0', method: 'CreateTransaction', params: [params.signedData] },
      { 'api-key': process.env.NOWNODES_API_KEY }
    );
    return { hash: result.result.TranID };
  } catch (err) {
    return { error: (err as Error).message };
  }
}


  /**
   * Функция-обертка для выполнения сетевого запроса.
   */
protected async request<T, U>(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  url: string,
  data?: U,
  headers?: Record<string, string | number>
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    body: data ? JSON.stringify(data) : undefined
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json() as Promise<T>;
}

}
