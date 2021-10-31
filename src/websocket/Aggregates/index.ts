export enum StockEvents {
  /** Stream real-time trades for a given stock ticker symbol. */
  ticker = 'T',
  /** Stream real-time quotes for a given stock ticker symbol. */
  quotes = 'Q',
  /** Stream real-time second aggregates for a given stock ticker symbol. */
  aggregatePerSec = 'A',
  /** Stream real-time minutes aggregates for a given stock ticker symbol. */
  aggregatePerMin = 'AM',
}

export type Aggregate = {
  /** The event type. */
  ev: StockEvents.aggregatePerSec | StockEvents.aggregatePerMin

  /** The ticker symbol for the given stock. */
  sym: string

  /** The tick volume. */
  v: number

  /** Today's accumulated volume. */
  av: number

  /** Today's official opening price. */
  op: number

  /** The tick's volume weighted average price. */
  vw: number

  /** The opening tick price for this aggregate window. */
  o: number

  /** The closing tick price for this aggregate window. */
  c: number

  /** The highest tick price for this aggregate window. */
  h: number

  /** The lowest tick price for this aggregate window. */
  l: number

  /** Today's volume weighted average price. */
  a: number

  /** The average trade size for this aggregate window. */
  z: number

  /** The timestamp of the starting tick for this aggregate window in Unix Milliseconds. */
  s: number

  /** The timestamp of the ending tick for this aggregate window in Unix Milliseconds. */
  e: number
}
