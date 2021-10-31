import { PolygonWS } from './websocket'
import { PolygonAPI } from './rest'

/** Wrapper of polygon api */
export class Polygon {
  private readonly apiKey: string
  /**
   * @param {string} apiKey - Your [Polygon API key](https://polygon.io/dashboard/api-keys)
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  ws(subscriptions?: string[]): PolygonWS {
    return new PolygonWS({ apiKey: this.apiKey, subscriptions })
  }

  api(): PolygonAPI {
    return new PolygonAPI({ apiKey: this.apiKey })
  }
}
