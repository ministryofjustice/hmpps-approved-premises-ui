import { AssessmentClient } from '../data'
import AssessmentService from './assessmentService'

import assessmentFactory from '../testutils/factories/assessment'

jest.mock('../data/assessmentClient.ts')

describe('AssessmentService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>
  const assessmentClientFactory = jest.fn()

  const service = new AssessmentService(assessmentClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    assessmentClientFactory.mockReturnValue(assessmentClient)
  })

  it('gets all the assesments for the logged in user and groups them by status', async () => {
    const acceptedAssessments = assessmentFactory.buildList(2, { decision: 'accepted' })
    const rejectedAssessments = assessmentFactory.buildList(3, { decision: 'rejected' })
    const awaitingAssessments = assessmentFactory.buildList(5, { decision: undefined })

    assessmentClient.all.mockResolvedValue([acceptedAssessments, rejectedAssessments, awaitingAssessments].flat())

    const result = await service.getAllForLoggedInUser('token')

    expect(result).toEqual({
      completed: [acceptedAssessments, rejectedAssessments].flat(),
      requestedFurtherInformation: [],
      awaiting: awaitingAssessments,
    })
  })
})
