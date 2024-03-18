import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import ReportClient from './reportClient'
import paths from '../paths/api'

import describeClient from '../testutils/describeClient'
import { ReportType, reportInputLabels } from '../utils/reportUtils'

describeClient('ReportClient', provider => {
  let client: ReportClient

  const token = 'token-1'

  beforeEach(() => {
    client = new ReportClient(token)
  })

  describe('getReport', () => {
    it.each(Object.keys(reportInputLabels))(
      'should pipe the report from the API when the report name is %s',
      async (reportName: ReportType) => {
        const month = '12'
        const year = '2023'
        const response = createMock<Response>({})

        provider.addInteraction({
          state: 'Server is healthy',
          uponReceiving: 'A request to get application reports ',
          withRequest: {
            method: 'GET',
            path: paths.reports({ reportName }),
            query: { month, year },
            headers: {
              authorization: `Bearer ${token}`,
              'X-Service-Name': 'approved-premises',
            },
          },
          willRespondWith: {
            status: 200,
          },
        })

        await client.getReport(reportName, month, year, response)

        expect(response.set).toHaveBeenCalledWith(
          'Content-Disposition',
          `attachment; filename="${reportName}-2023-12.xlsx"`,
        )
      },
    )
  })
})
