import PremisesService from './premisesService'
import PremisesClient from '../../data/temporary-accommodation/premisesClient'

jest.mock('../../data/temporary-accommodation/premisesClient')
jest.mock('../../utils/premisesUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const premisesClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
  })

  describe('create', () => {
    it('on success returns the booking that has been posted', async () => {
      const premises = {
        id: 'some-id',
        added_at: 'some date',
        county: 'some county',
        town: 'some town',
        type: 'shared',
        address: 'some address',
      }
      const newPremises = {
        county: 'some county',
        town: 'some town',
        type: 'shared',
        address: 'some address',
      }
      premisesClient.create.mockResolvedValue(premises)

      const postedPremises = await service.create(token, newPremises)
      expect(postedPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.create).toHaveBeenCalledWith(newPremises)
    })
  })
})
