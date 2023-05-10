import type { SuperAgentRequest } from 'superagent'

import type { Room } from '@approved-premises/api'

import { stubFor } from '../../wiremock'
import paths from '../../server/paths/manage'

export default {
  stubRooms: (args: { premisesId: string; rooms: Array<Room> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.premises.rooms({ premisesId: args.premisesId }),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.rooms,
      },
    }),
}
