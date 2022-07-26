import type { Premises } from 'approved-premises'

import { stubFor } from '../../wiremock'

export default {
  stubPremises: (premises: Array<Premises>) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/premises',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: premises,
      },
    }),

  stubSinglePremises: (premises: Premises) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/premises/${premises.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: premises,
      },
    }),
}
