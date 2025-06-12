import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import ReportClient from './reportClient'
import paths from '../paths/api'

import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { ReportType, reportInputLabels } from '../utils/reportUtils'

describeCas1NamespaceClient('ReportClient', provider => {
  let client: ReportClient

  const token = 'token-1'

  beforeEach(() => {
    client = new ReportClient(token)
  })

  describe('getReport', () => {
    it.each(Object.keys(reportInputLabels))(
      'should pipe the report from the API when the report name is %s',
      async (reportName: ReportType) => {
        const startDate = '2025-02-01'
        const endDate = '2025-04-30'
        const response = createMock<Response>({})

        provider.addInteraction({
          state: 'Server is healthy',
          uponReceiving: 'A request to get application reports ',
          withRequest: {
            method: 'GET',
            path: paths.reports({ reportName }),
            query: { startDate, endDate },
            headers: {
              authorization: `Bearer ${token}`,
              'X-Service-Name': 'approved-premises',
            },
          },
          willRespondWith: {
            status: 200,
          },
        })

        await client.getReport(reportName, startDate, endDate, response)
      },
    )
  })
})
