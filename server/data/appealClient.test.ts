import AppealClient from './appealClient'
import { appealFactory, applicationFactory, newAppealFactory } from '../testutils/factories'
import describeClient from '../testutils/describeClient'
import paths from '../paths/api'

describeClient('AppealClient', provider => {
  let appealsClient: AppealClient

  const token = 'token-1'

  beforeEach(() => {
    appealsClient = new AppealClient(token)
  })

  describe('create', () => {
    it('should create an appeal', async () => {
      const newAppeal = newAppealFactory.build()
      const appeal = appealFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for an appeal',
        withRequest: {
          method: 'POST',
          path: paths.applications.appeals.create({ id: appeal.applicationId }),
          body: newAppeal,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 201,
          body: appeal,
        },
      })

      const result = await appealsClient.create(appeal.applicationId, newAppeal)

      expect(result).toEqual(appeal)
    })
  })

  describe('find', () => {
    it('should return an application', async () => {
      const application = applicationFactory.build()
      const appeal = appealFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for an appeal',
        withRequest: {
          method: 'GET',
          path: paths.applications.appeals.show({ id: application.id, appealId: appeal.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: appeal,
        },
      })

      const result = await appealsClient.find(application.id, appeal.id)

      expect(result).toEqual(appeal)
    })
  })
})
