import { readFileSync } from 'fs'
import path from 'path'

import paths from '../../server/paths/api'
import { stubFor } from './setup'
import { createQueryString } from '../../server/utils/utils'
import { ReportType } from '../../server/utils/reportUtils'

export default {
  stubReport: (args: { startDate: string; endDate: string; reportName: ReportType }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.reports({ reportName: args.reportName })}?${createQueryString({
          startDate: args.startDate,
          endDate: args.endDate,
        })}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'content-disposition': `attachment; filename=${`${args.reportName}-${args.startDate}-to-${args.endDate}-20250611_1602.xlsx`}`,
        },
        base64Body: readFileSync(path.resolve(__dirname, '..', 'fixtures', 'report.xlsx'), {
          encoding: 'base64',
        }),
      },
    }),
}
