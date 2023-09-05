import type { Response } from 'express'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'

import paths from '../paths/api'
import { createQueryString } from '../utils/utils'

export default class ReportClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('reportClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async getApplicationsReport(month: string, year: string, response: Response): Promise<void> {
    const filename = `applications-${year}-${month.padStart(2, '0')}.xlsx`
    response.set('Content-Disposition', `attachment; filename="${filename}"`)

    await this.restClient.pipe(
      {
        path: paths.reports.applications({}),
        query: createQueryString({ month, year }),
      },
      response,
    )
  }

  async getLostBedsReport(month: string, year: string, response: Response): Promise<void> {
    const filename = `lost-beds-${year}-${month.padStart(2, '0')}.xlsx`
    response.set('Content-Disposition', `attachment; filename="${filename}"`)

    await this.restClient.pipe(
      {
        path: paths.reports.lostBeds({}),
        query: createQueryString({ month, year }),
      },
      response,
    )
  }
}
