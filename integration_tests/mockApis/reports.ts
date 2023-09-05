import { readFileSync } from 'fs'
import path from 'path'

import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import { createQueryString } from '../../server/utils/utils'

export default {
  stubLostBedsReport: (args: { month: string; year: string }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `${paths.reports.lostBeds({})}?${createQueryString({ month: args.month, year: args.year })}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'content-disposition': `attachment; filename=${`lost-beds-${args.year}-${args.month.padStart(2, '0')}.xlsx`}`,
        },
        base64Body: readFileSync(path.resolve(__dirname, '..', 'fixtures', 'report.xlsx'), {
          encoding: 'base64',
        }),
      },
    }),
}
