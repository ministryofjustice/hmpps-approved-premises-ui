import type { Response } from 'express'

import type { RestClientBuilder } from '../data'

import ReportClient from '../data/reportClient'
import { ReportType } from '../utils/reportUtils'

export default class ReportService {
  constructor(private readonly reportClientFactory: RestClientBuilder<ReportClient>) {}

  async getReport(
    token: string,
    startDate: string,
    endDate: string,
    reportType: ReportType,
    response: Response,
  ): Promise<void> {
    const client = this.reportClientFactory(token)

    return client.getReport(reportType, startDate, endDate, response)
  }
}
