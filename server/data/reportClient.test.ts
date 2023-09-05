import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import ReportClient from './reportClient'
import paths from '../paths/api'

import describeClient from '../testutils/describeClient'

describeClient('ReportClient', provider => {
  let client: ReportClient

  const token = 'token-1'

  beforeEach(() => {
    client = new ReportClient(token)
  })

  describe('getApplicationsReport', () => {
    it('should pipe the report from the API', async () => {
      const month = '12'
      const year = '2023'
      const response = createMock<Response>({})

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get application reports ',
        withRequest: {
          method: 'GET',
          path: paths.reports.applications({}),
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

      await client.getApplicationsReport(month, year, response)

      expect(response.set).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="applications-2023-12.xlsx"`,
      )
    })
  })

  describe('getLostBedsReport', () => {
    it('should pipe the report from the API', async () => {
      const month = '12'
      const year = '2023'
      const response = createMock<Response>({})

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get lost beds reports',
        withRequest: {
          method: 'GET',
          path: paths.reports.lostBeds({}),
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

      await client.getLostBedsReport(month, year, response)

      expect(response.set).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="lost-beds-2023-12.xlsx"`)
    })
  })
})
