import nock from 'nock'

import PlacementRequestClient from './placementRequestClient'
import config from '../config'
import paths from '../paths/api'

import placementRequestFactory from '../testutils/factories/placementRequest'

describe('placementRequestClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let placementRequestClient: PlacementRequestClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    config.flags.oasysDisabled = false
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    placementRequestClient = new PlacementRequestClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('all', () => {
    it('makes a get request to the placementRequests endpoint', async () => {
      const placementRequests = placementRequestFactory.buildList(2)

      fakeApprovedPremisesApi
        .get(paths.placementRequests.index.pattern)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, placementRequests)

      const result = await placementRequestClient.all()

      expect(result).toEqual(placementRequests)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
