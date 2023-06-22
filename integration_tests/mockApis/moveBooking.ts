import { SuperAgentRequest } from 'superagent'
import { NewBedMove } from '../../server/@types/shared'
import { stubFor } from '../../wiremock'
import paths from '../../server/paths/manage'

export default {
  stubMoveBooking: (args: { bedMove: NewBedMove; bookingId: string; premisesId: string }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.bookings.moves.create({ bookingId: args.bookingId, premisesId: args.premisesId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.bedMove,
      },
    }),
}
