import nock from 'nock'

import PremisesClient from './premisesClient'
import config from '../../config'
import paths from '../../paths/api'

describe('PremisesClient', () => {
  let fakeApi: nock.Scope
  let premisesClient: PremisesClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApi = nock(config.apis.approvedPremises.url)
    premisesClient = new PremisesClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('create', () => {
    it('should return the premises that has been created', async () => {
      const premises = {
        id: 'some-id',
        added_at: 'some date',
        county: 'some county',
        town: 'some town',
        type: 'shared',
        address: 'some address',
      }
      const payload = {
        county: 'some county',
        town: 'some town',
        type: 'shared',
        address: 'some address',
      }

      fakeApi
        .post(paths.temporaryAccommodation.premises.create({}))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, premises)

      const output = await premisesClient.create(payload)
      expect(output).toEqual(premises)
    })
  })
})
