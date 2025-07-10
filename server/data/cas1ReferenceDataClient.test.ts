import { LostBedReason } from '@approved-premises/api'

import Cas1ReferenceDataClient from './cas1ReferenceDataClient'
import { cas1ReferenceDataFactory, cruManagementAreaFactory } from '../testutils/factories'
import { describeCas1NamespaceClient } from '../testutils/describeClient'

describeCas1NamespaceClient('Cas1ReferenceDataClient', provider => {
  let cas1ReferenceDataClient: Cas1ReferenceDataClient

  const token = 'token-1'

  beforeEach(() => {
    cas1ReferenceDataClient = new Cas1ReferenceDataClient(token)
  })

  describe('getReferenceData', () => {
    const data = {
      'out-of-service-bed-reasons': cas1ReferenceDataFactory
        .outOfServiceBedReason()
        .buildList(5) as Array<LostBedReason>,
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
