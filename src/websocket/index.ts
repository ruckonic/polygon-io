import { EventEmitter } from 'events'
import WebSocket from 'ws'

import { Aggregate, StockEvents } from './Aggregates'

export enum Tape {
  NYSE = 1,
  AMEX,
  NASDAQ,
}

export type StockEvent = `${StockEvents}`

type StockSubscription = `${StockEvent}.${string}`

export type Ticker = {
  /** The event type. */
  ev: StockEvents.ticker

  /** The ticker symbol for the given stock */
  sym: string

  /** The exchange ID. See [Exchanges](https://polygon.io/docs/get_v1_meta_exchanges_anchor) for Polygon.io's mapping of exchange IDs.*/
  x: number

  /** The trade ID*/
  i: string

  /** The tape. (1 = NYSE, 2 = AMEX, 3 = Nasdaq). */
  z: Tape

  /** The price. */
  p: number

  /** The trade size. */
  s: number

  /** The trade conditions */
  c: number[]

  /** The Timestamp in Unix MS. */
  t: number
}

interface IEvent {
  on(event: 'T', listener: (ticker: Ticker) => void): this
  on(event: 'A' | 'AM', listener: (aggregate: Aggregate) => void): this
  on(event: string, listener: (...args: any[]) => void): this
}

export class PolygonWS extends EventEmitter implements IEvent {
  private apiKey: string
  private ws: WebSocket | null
  public subscriptions: StockSubscription[] = []
  public connected = false

  constructor(params: { apiKey: string; subscriptions?: string[] }) {
    super()
    console.log('Polygon class initialized..')
    this.ws = null
    this.subscriptions = []
    this.apiKey = params.apiKey
  }

  public subscribe(
    channel: StockEvent | StockEvents,
    tickers: string | string[]
  ): void
  public subscribe(subscribe: StockSubscription): void
  public subscribe(subscribe: StockSubscription[]): void
  public subscribe(
    channel: StockEvents | StockEvent | StockSubscription | StockSubscription[],
    tickers?: string | string[]
  ): void {
    const subs: StockSubscription[] = []
    if (channel && tickers && Array.isArray(tickers)) {
      const tickersArray = tickers.map(
        (t) => `${channel}.${t}` as StockSubscription
      )
      subs.push(...tickersArray)
    } else {
      if (Array.isArray(channel)) {
        subs.push(...channel)
      } else {
        subs.push(channel as StockSubscription)
      }
    }

    if (this.connected) this.sendSubscriptions(subs)
  }

  /**
   * wait for the connection to be established
   */
  public async connect(): Promise<boolean> {
    this.connected = false
    this.ws = new WebSocket('wss://socket.polygon.io/stocks')
    this.ws.on('close', this.onDisconnect.bind(this))
    this.ws.on('open', this.onOpen.bind(this))
    this.ws.on('disconnect', this.onDisconnect.bind(this))
    this.ws.on('error', this.onError.bind(this))
    this.ws.on('message', this.onMessage.bind(this))

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 5000)
    })
  }

  /** Listen Stock Tickers */
  on(event: 'T', listener: (ticker: Ticker) => void): this
  on(event: 'A' | 'AM', listener: (aggregate: Aggregate) => void): this
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    super.on(event, listener)
    return this
  }

  private onOpen() {
    this.ws?.send(`{"action":"auth","params":"${this.apiKey}"}`)
    this.connected = true
  }

  private sendSubscriptions(
    subscriptions: StockSubscription | StockSubscription[]
  ) {
    if (subscriptions.length === 0) {
      throw new Error('No subscriptions provided')
    }
    const sub = Array.isArray(subscriptions) ? subscriptions : [subscriptions]
    this.ws?.send(`{"action":"subscribe","params":"${sub.join(',')}"}`)
  }

  private onDisconnect() {
    console.log('\n\n\n\n\nconnecting\n\n\n\n\n')
    /** Re-connect strategic */
    setTimeout(this.connect.bind(this), 2000)
  }

  private onError(e: Error) {
    console.log('Error:', e)
  }

  private onMessage(data: string) {
    const _data: { [key: string]: any } = JSON.parse(data)

    _data.map((msg: { ev: string | 'status'; [key: string]: any }) => {
      if (msg.ev === 'status') {
        console.log('Status Update:', msg.message)
      }

      this.emit(msg.ev, { ...msg, date: new Date().toISOString() })
    })
  }

  closeConnection(): void {
    this.ws?.removeAllListeners()
    this.ws?.close()
    this.ws = null
  }
}
