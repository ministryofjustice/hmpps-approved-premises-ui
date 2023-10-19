import { readFileSync } from 'fs'
import path from 'path'

import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import { createQueryString } from '../../server/utils/utils'
import { ReportType } from '../../server/utils/reportUtils'

export default {
  stubReport: (args: { month: string; year: string; reportName: ReportType }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.reports({ reportName: args.reportName })}?${createQueryString({
          month: args.month,
          year: args.year,
        })}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'content-disposition': `attachment; filename=${`${args.reportName}-${args.year}-${args.month.padStart(
            2,
            '0',
          )}.xlsx`}`,
        },
        base64Body: readFileSync(path.resolve(__dirname, '..', 'fixtures', 'report.xlsx'), {
          encoding: 'base64',
        }),
      },
    }),
}
