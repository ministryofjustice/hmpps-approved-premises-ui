import type { Response } from 'express'

import type { RestClientBuilder } from '../data'

import ReportClient from '../data/reportClient'

export class OasysNotFoundError extends Error {}

export default class ReportService {
  constructor(private readonly reportClientFactory: RestClientBuilder<ReportClient>) {}

  async getReport(token: string, month: string, year: string, response: Response): Promise<void> {
    const client = this.reportClientFactory(token)

    return client.getReport(month, year, response)
  }
}
