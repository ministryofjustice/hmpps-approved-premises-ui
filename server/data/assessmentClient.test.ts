import nock from 'nock'

import AssessmentClient from './assessmentClient'
import config from '../config'
import assessmentFactory from '../testutils/factories/assessment'
import clarificationNoteFactory from '../testutils/factories/clarificationNote'
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

  describe('update', () => {
    it('should return an assessment when a PUT request is made', async () => {
      const assessment = assessmentFactory.build()

      fakeApprovedPremisesApi
        .put(paths.assessments.update({ id: assessment.id }), { data: assessment.data })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, assessment)

      const result = await assessmentClient.update(assessment)

      expect(result).toEqual(assessment)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('createClarificationNote', () => {
    it('should return a note when a POST request is made', async () => {
      const assessmentId = 'some-id'
      const note = clarificationNoteFactory.build()

      fakeApprovedPremisesApi
        .post(paths.assessments.clarificationNotes.create({ id: assessmentId }), note)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, note)

      const result = await assessmentClient.createClarificationNote(assessmentId, note)

      expect(result).toEqual(note)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
