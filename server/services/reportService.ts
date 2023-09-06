import type { Response } from 'express'

import type { RestClientBuilder } from '../data'

import ReportClient from '../data/reportClient'

export class OasysNotFoundError extends Error {}

export default class ReportService {
  constructor(private readonly reportClientFactory: RestClientBuilder<ReportClient>) {}

  async getReport(
    token: string,
    month: string,
    year: string,
    reportType: 'applications' | 'lostBeds',
    response: Response,
  ): Promise<void> {
    const client = this.reportClientFactory(token)

    switch (reportType) {
      case 'lostBeds':
        return client.getLostBedsReport(month, year, response)
      case 'applications':
        return client.getApplicationsReport(month, year, response)
      default:
        throw new Error(`Unknown report type ${reportType}`)
    }
  }
}
