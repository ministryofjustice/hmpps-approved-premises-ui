import PremisesClient from './premisesClient'
import paths from '../paths/api'

import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { premisesFactory } from '../testutils/factories'

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
})
