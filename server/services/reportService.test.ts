import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import ReportClient from '../data/reportClient'
import ReportService from './reportService'

jest.mock('../data/reportClient.ts')

describe('ReportService', () => {
  const reportClient = new ReportClient(null) as jest.Mocked<ReportClient>
  const reportClientFactory = jest.fn()

  const service = new ReportService(reportClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    reportClientFactory.mockReturnValue(reportClient)
  })

  describe('getReport', () => {
    it('pipes the report to the response', async () => {
      const response = createMock<Response>({})
      await service.getReport(token, '12', '2023', response)

      expect(reportClientFactory).toHaveBeenCalledWith(token)
      expect(reportClient.getReport).toHaveBeenCalledWith('12', '2023', response)
    })
  })
})