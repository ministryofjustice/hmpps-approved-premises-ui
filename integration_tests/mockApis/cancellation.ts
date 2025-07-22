import type { SuperAgentRequest } from 'superagent'
import type { Cancellation } from '@approved-premises/api'
import paths from '../../server/paths/api'

import { stubFor } from './setup'
import { errorStub } from './utils'

import { cancellationReasons } from '../../server/testutils/referenceData/stubs/referenceDataStubs'

export default {
  stubCancellationReferenceData: (): SuperAgentRequest => stubFor(cancellationReasons),

  stubCancellationCreate: (args: {
    premisesId: string
    placementId: string
    cancellation: Cancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.placements.cancel({ premisesId: args.premisesId, placementId: args.placementId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.cancellation,
      },
    }),
  stubCancellationErrors: (args: { premisesId: string; placementId: string; params: Array<string> }) =>
    stubFor(
      errorStub(
        args.params,
        paths.premises.placements.cancel({
          premisesId: args.premisesId,
          placementId: args.placementId,
        }),
      ),
    ),
}
