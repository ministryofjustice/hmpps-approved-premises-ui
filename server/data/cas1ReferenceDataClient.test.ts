import Cas1ReferenceDataClient from './cas1ReferenceDataClient'
import {
  cas1DepartureReasonsFactory,
  cas1OutOfServiceBedReasonFactory,
  cas1ReferenceDataFactory,
  cruManagementAreaFactory,
} from '../testutils/factories'
import { describeCas1NamespaceClient } from '../testutils/describeClient'

describeCas1NamespaceClient('Cas1ReferenceDataClient', provider => {
  let cas1ReferenceDataClient: Cas1ReferenceDataClient

  const token = 'token-1'

  beforeEach(() => {
    cas1ReferenceDataClient = new Cas1ReferenceDataClient(token)
  })

  describe('getReferenceData', () => {
    const data = {
      'non-arrival-reasons': cas1ReferenceDataFactory.buildList(1),
      'departure-reasons': cas1DepartureReasonsFactory.buildList(1),
      'move-on-categories': cas1ReferenceDataFactory.buildList(1),
    }

    Object.keys(data).forEach((key: keyof typeof data) => {
      it(`should return an array of ${key}`, async () => {
        await provider.addInteraction({
          state: 'Server is healthy',
          uponReceiving: `A request to get ${key}`,
          withRequest: {
            method: 'GET',
            path: `/cas1/reference-data/${key}`,
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
          willRespondWith: {
            status: 200,
            body: data[key],
          },
        })

        const output = await cas1ReferenceDataClient.getReferenceData(key)
        expect(output).toEqual(data[key])
      })
    })
  })

  describe('getOutOfServiceBedReasons', () => {
    it(`should return an array of OOSB reasons`, async () => {
      const outOfServiceBedReasons = cas1OutOfServiceBedReasonFactory.buildList(5)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get OOSB reasons`,
        withRequest: {
          method: 'GET',
          path: `/cas1/reference-data/out-of-service-bed-reasons`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBedReasons,
        },
      })

      const output = await cas1ReferenceDataClient.getOutOfServiceBedReasons()
      expect(output).toEqual(outOfServiceBedReasons)
    })
  })

  describe('getCruManagementAreas', () => {
    it('should return an array of CRU management areas', async () => {
      const cruManagementAreas = cruManagementAreaFactory.buildList(5)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: `A request to get CRU management areas`,
        withRequest: {
          method: 'GET',
          path: `/cas1/reference-data/cru-management-areas`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: cruManagementAreas,
        },
      })

      const output = await cas1ReferenceDataClient.getCruManagementAreas()
      expect(output).toEqual(cruManagementAreas)
    })
  })
})
