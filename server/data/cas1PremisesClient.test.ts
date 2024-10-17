import PremisesClient from './premisesClient'
import paths from '../paths/api'

import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { cas1PremisesSummaryFactory, premisesFactory } from '../testutils/factories'

describeCas1NamespaceClient('Cas1PremisesClient', provider => {
  let premisesClient: PremisesClient

  const sampleToken = 'sampleToken'

  beforeEach(() => {
    premisesClient = new PremisesClient(sampleToken)
  })

  describe('find', () => {
    const premises = premisesFactory.build()

    it('should get a single premises', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a single premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.show({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${sampleToken}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premises,
        },
      })

      const output = await premisesClient.find(premises.id)
      expect(output).toEqual(premises)
    })
  })

  describe('allCas1', () => {
    it('should get all premises', async () => {
      const gender = 'man'
      const premisesSummaries = cas1PremisesSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all CAS1 premises summaries',
        withRequest: {
          method: 'GET',
          path: paths.premises.indexCas1({ gender }),
          headers: {
            authorization: `Bearer ${sampleToken}`,
            'X-Service-Name': 'approved-premises',
          },
          query: { gender },
        },
        willRespondWith: {
          status: 200,
          body: premisesSummaries,
        },
      })

      const output = await premisesClient.allCas1({ gender })
      expect(output).toEqual(premisesSummaries)
    })
  })
})
