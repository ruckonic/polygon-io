import got from 'got'

export interface Snapshots {
  /** The total number of results for this request. */
  count: number

  /** The status of this request's response.*/
  status: string
  tickers: Ticker[]
}

export interface Snapshot {
  /** The status of this request's response.*/
  status: string
  ticker: Ticker
}

export type SymbolPricesForPeriod = {
  /** The close price for the symbol in the given time period.*/
  c: number

  /** The highest price for the symbol in the given time period. */
  h: number

  /** The lowest price for the symbol in the given time period. */
  l: number

  /** The open price for the symbol in the given time period. */
  o: number

  /** The trading volume of the symbol in the given time period. */
  v: number

  /** The volume weighted average price. */
  vw: number
}

export interface Ticker {
  day: SymbolPricesForPeriod
  lastQuote: LastQuote
  lastTrade: LastTrade
  min: SymbolPricesForLastMinute
  prevDay: SymbolPricesForPeriod

  /** The exchange symbol that this item is traded under. */
  ticker: string

  /** The value of the change the from previous day. */
  todaysChange: number

  /** The percentage change since the previous day. */
  todaysChangePerc: number

  /** The last updated timestamp. */
  updated: number
}

export type LastQuote = {
  /** The ask price. */
  P: number

  /** The ask size in lots. */
  S: number

  /** The bid price. */
  p: number

  /** The bid size in lots. */
  s: number

  /** The Unix Msec timestamp for the start of the aggregate window. */
  t: number
}

export type LastTrade = {
  /** The trade conditions. */
  c: number[]

  /** The Trade ID which uniquely identifies a trade. These are unique per combination of ticker, exchange, and TRF. For example: A trade for AAPL executed on NYSE and a trade for AAPL executed on NASDAQ could potentially have the same Trade ID. */
  i: string

  /** The price of the trade. This is the actual dollar value per whole share of this trade. A trade of 100 shares with a price of $2.00 would be worth a total dollar value of $200.00. */
  p: number

  /** The size (volume) of the trade. */
  s: number

  /** The Unix Msec timestamp for the start of the aggregate window. */
  t: number

  /** The exchange ID. See [Exchanges](https://polygon.io/docs/get_v1_meta_exchanges_anchor) for Polygon.io's mapping of exchange IDs. */
  x: number
}

/** The last available minute bar. */
export type SymbolPricesForLastMinute = {
  /** The accumulated volume. */
  av: number
} & SymbolPricesForPeriod

export class PolygonAPI {
  private baseUrl = 'https://api.polygon.io'
  private apiKey = ''

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey
  }

  /**
   *
   * #### Support a Ticker or Array of Tickers
   * Get the current minute, day, and previous day’s aggregate, as well as the last trade and quote for all traded stock symbols.
   *
   * **Note:** Snapshot data is cleared at 12am EST and gets populated as data is received from the exchanges. This can happen as early as 4am EST.
   */
  public async snapshot(ticker: string): Promise<Snapshot>
  public async snapshot(tickers: string[]): Promise<Snapshots>
  public async snapshot(
    tickers: string[] | string
  ): Promise<Snapshots | Snapshot> {
    let url = `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers`
    let searchParams: { tickers: string } | undefined

    if (!Array.isArray(tickers)) {
      url += `/${tickers}`
    } else {
      searchParams = { tickers: tickers.join(',') }
    }

    const response = await got<Snapshot | Snapshots>(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      responseType: 'json',
      searchParams,
    })

    return response.body
  }
}
