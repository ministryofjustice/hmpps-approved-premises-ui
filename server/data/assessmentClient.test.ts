import { faker } from '@faker-js/faker'
import AssessmentClient from './assessmentClient'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  clarificationNoteFactory,
  placementRequestFactory,
} from '../testutils/factories'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('AssessmentClient', provider => {
  let assessmentClient: AssessmentClient

  const token = 'token-1'

  const assessmentId = faker.string.uuid()

  beforeEach(() => {
    assessmentClient = new AssessmentClient(token)
  })

  describe('all', () => {
    it('should get all assessments', async () => {
      const assessments = assessmentSummaryFactory.buildList(3)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all assessments',
        withRequest: {
          method: 'GET',
          path: paths.assessments.index.pattern,
          query: {
            statuses: 'awaiting_response,completed',
            page: '1',
            sortBy: 'name',
            sortDirection: 'desc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: assessments,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const result = await assessmentClient.all(['awaiting_response', 'completed'], 1, 'name', 'desc')

      expect(result).toEqual({
        data: assessments,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })
  })

  describe('find', () => {
    it('should get an assessment', async () => {
      const assessment = assessmentFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get an assessment',
        withRequest: {
          method: 'GET',
          path: paths.assessments.show({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: assessment,
        },
      })

      const result = await assessmentClient.find(assessment.id)

      expect(result).toEqual(assessment)
    })
  })

  describe('update', () => {
    it('should return an assessment when a PUT request is made', async () => {
      const assessment = assessmentFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update an assessment',
        withRequest: {
          method: 'PUT',
          path: paths.assessments.update({ id: assessment.id }),
          body: { data: assessment.data },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: assessment,
        },
      })

      const result = await assessmentClient.update(assessment)

      expect(result).toEqual(assessment)
    })
  })

  describe('acceptance', () => {
    it('should call the acceptance endpoint with the assessment', async () => {
      const data = {
        document: {},
        requirements: placementRequestFactory.build(),
      }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to accept an assessment',
        withRequest: {
          method: 'POST',
          path: paths.assessments.acceptance({ id: assessmentId }),
          body: data,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.acceptance(assessmentId, data)
    })
  })

  describe('rejection', () => {
    it('should call the rejection endpoint with the assessment', async () => {
      const assessment = assessmentFactory.build()
      const response = { section: [{ task: 'response' }] }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to reject an assessment',
        withRequest: {
          method: 'POST',
          path: paths.assessments.rejection({ id: assessment.id }),
          body: {
            document: response,
            rejectionRationale: assessment.rejectionRationale,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.rejection(assessment.id, response, assessment.rejectionRationale)
    })
  })

  describe('createClarificationNote', () => {
    it('should return a note when a POST request is made', async () => {
      const note = clarificationNoteFactory.build()
      const newNote = {
        query: note.query,
      }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a clarification note',
        withRequest: {
          method: 'POST',
          path: paths.assessments.clarificationNotes.create({ id: assessmentId }),
          body: newNote,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 201,
          body: note,
        },
      })

      const result = await assessmentClient.createClarificationNote(assessmentId, newNote)

      expect(result).toEqual(note)
    })
  })

  describe('updateClarificationNote', () => {
    it('should return a note when a PUT request is made', async () => {
      const note = clarificationNoteFactory.build()
      const updatedNote = {
        response: note.response,
        responseReceivedOn: note.responseReceivedOn,
      }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a clarification note',
        withRequest: {
          method: 'PUT',
          path: paths.assessments.clarificationNotes.update({ id: assessmentId, clarificationNoteId: note.id }),
          body: updatedNote,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 201,
          body: note,
        },
      })

      const result = await assessmentClient.updateClarificationNote(assessmentId, note.id, updatedNote)

      expect(result).toEqual(note)
    })
  })
})
