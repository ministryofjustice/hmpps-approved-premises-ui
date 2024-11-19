import {
  CancellationReason,
  DepartureReason,
  DestinationProvider,
  LostBedReason,
  MoveOnCategory,
  NonArrivalReason,
} from '@approved-premises/api'

import ReferenceDataClient from './referenceDataClient'
import { probationRegionFactory, referenceDataFactory } from '../testutils/factories'
import describeClient from '../testutils/describeClient'
import { apAreaFactory, nonArrivalReasonsFactory } from '../testutils/factories/referenceData'

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

  describe('getProbationRegions', () => {
    it('should return an array of probation regions', async () => {
      const probationRegions = probationRegionFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get probation regions`,
        withRequest: {
          method: 'GET',
          path: `/reference-data/probation-regions`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: probationRegions,
        },
      })

      const output = await referenceDataClient.getProbationRegions()
      expect(output).toEqual(probationRegions)
    })
  })

  describe('getApAreas', () => {
    it('should return an array of AP areas', async () => {
      const apAreas = apAreaFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get AP areas`,
        withRequest: {
          method: 'GET',
          path: `/reference-data/ap-areas`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: apAreas,
        },
      })

      const output = await referenceDataClient.getApAreas()
      expect(output).toEqual(apAreas)
    })
  })

  describe('getNonArrivalReasons', () => {
    it('should return an array of non-arrival reasons', async () => {
      const nonArrivalReasons = nonArrivalReasonsFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get Non-arrival reasons`,
        withRequest: {
          method: 'GET',
          path: `/reference-data/non-arrival-reasons`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: nonArrivalReasons,
        },
      })

      const output = await referenceDataClient.getNonArrivalReasons()
      expect(output).toEqual(nonArrivalReasons)
    })
  })
})
