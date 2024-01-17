import {
  CancellationReason,
  DepartureReason,
  DestinationProvider,
  LostBedReason,
  MoveOnCategory,
  NonArrivalReason,
  ProbationRegion,
} from '@approved-premises/api'

import ReferenceDataClient from './referenceDataClient'
import { referenceDataFactory } from '../testutils/factories'
import describeClient from '../testutils/describeClient'

describeClient('ReferenceDataClient', provider => {
  let referenceDataClient: ReferenceDataClient

  const token = 'token-1'

  beforeEach(() => {
    referenceDataClient = new ReferenceDataClient(token)
  })

  describe('getReferenceData', () => {
    const data = {
      'departure-reasons': referenceDataFactory.departureReasons().buildList(5) as Array<DepartureReason>,
      'move-on-categories': referenceDataFactory.moveOnCategories().buildList(5) as Array<MoveOnCategory>,
      'destination-providers': referenceDataFactory.destinationProviders().buildList(5) as Array<DestinationProvider>,
      'cancellation-reasons': referenceDataFactory.cancellationReasons().buildList(5) as Array<CancellationReason>,
      'lost-bed-reasons': referenceDataFactory.lostBedReasons().buildList(5) as Array<LostBedReason>,
      'non-arrival-reasons': referenceDataFactory.nonArrivalReason().buildList(5) as Array<NonArrivalReason>,
      'probation-regions': referenceDataFactory.probationRegions().buildList(5) as Array<ProbationRegion>,
    }

    Object.keys(data).forEach(key => {
      it(`should return an array of ${key}`, async () => {
        provider.addInteraction({
          state: 'Server is healthy',
          uponReceiving: `A request to get ${key}`,
          withRequest: {
            method: 'GET',
            path: `/reference-data/${key}`,
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
          willRespondWith: {
            status: 200,
            body: data[key],
          },
        })

        const output = await referenceDataClient.getReferenceData(key)
        expect(output).toEqual(data[key])
      })
    })
  })
})
