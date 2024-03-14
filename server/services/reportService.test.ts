import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import ReportClient from '../data/reportClient'
import ReportService from './reportService'
import { ReportType, reportInputLabels } from '../utils/reportUtils'

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
    // We have to set up `it.each` in a slightly odd way, because Jest doesn't support `it.each` out
    // of the box with asynchronous functions. See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34617
    it.each<ReportType | jest.DoneCallback>(Object.keys(reportInputLabels))(
      'calls the getApplicationsReport client method when the reportType is "applications" pipes the report to the response',
      (reportName: ReportType, done: jest.DoneCallback) => {
        const response = createMock<Response>({})
        service.getReport(token, '12', '2023', reportName, response).then(() => {
          expect(reportClientFactory).toHaveBeenCalledWith(token)
          expect(reportClient.getReport).toHaveBeenCalledWith(reportName, '12', '2023', response)
        })
        done()
      },
    )
  })
})
