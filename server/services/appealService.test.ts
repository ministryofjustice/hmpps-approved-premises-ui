import { AppealClient } from '../data'
import AppealService from './appealService'
import { appealFactory, newAppealFactory } from '../testutils/factories'

jest.mock('../data/appealClient.ts')

describe('AppealService', () => {
  const appealClient = new AppealClient(null) as jest.Mocked<AppealClient>
  const appealClientFactory = jest.fn()

  const service = new AppealService(appealClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    appealClientFactory.mockReturnValue(appealClient)
  })

  describe('createAppeal', () => {
    it('calls the createAppeal client method and returns the result', async () => {
      const appeal = appealFactory.build()
      const newAppeal = newAppealFactory.build()

      appealClient.create.mockResolvedValue(appeal)

      const result = await service.createAppeal(token, appeal.applicationId, newAppeal)

      expect(appealClientFactory).toHaveBeenCalledWith(token)
      expect(appealClient.create).toHaveBeenCalledWith(appeal.applicationId, newAppeal)
      expect(result).toEqual(appeal)
    })
  })
})
