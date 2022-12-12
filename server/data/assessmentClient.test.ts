import nock from 'nock'

import AssessmentClient from './assessmentClient'
import config from '../config'
import assessmentFactory from '../testutils/factories/assessment'
import paths from '../paths/api'

describe('AssessmentClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let assessmentClient: AssessmentClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    assessmentClient = new AssessmentClient(token)
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
    it('should get all assessments', async () => {
      const assessments = assessmentFactory.buildList(3)

      fakeApprovedPremisesApi
        .get(paths.assessments.index.pattern)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, assessments)

      const result = await assessmentClient.all()

      expect(result).toEqual(assessments)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('find', () => {
    it('should get an assessment', async () => {
      const assessment = assessmentFactory.build()

      fakeApprovedPremisesApi
        .get(paths.assessments.show({ id: assessment.id }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, assessment)

      const result = await assessmentClient.find(assessment.id)

      expect(result).toEqual(assessment)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
