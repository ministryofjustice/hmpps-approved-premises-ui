import { Assessment } from '@approved-premises/api'
import { AssessmentClient, PersonClient } from '../data'
import AssessmentService from './assessmentService'

import assessmentFactory from '../testutils/factories/assessment'
import risksFactory from '../testutils/factories/risks'

jest.mock('../data/assessmentClient.ts')
jest.mock('../data/personClient.ts')

describe('AssessmentService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>
  const personClient = new PersonClient(null) as jest.Mocked<PersonClient>

  const assessmentClientFactory = jest.fn()
  const personClientFactory = jest.fn()

  const service = new AssessmentService(assessmentClientFactory, personClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    assessmentClientFactory.mockReturnValue(assessmentClient)
    personClientFactory.mockReturnValue(personClient)
  })

  it('gets all the assesments for the logged in user and groups them by status', async () => {
    const risks = risksFactory.build()
    const acceptedAssessments = assessmentFactory.buildList(2, { decision: 'accepted' })
    const rejectedAssessments = assessmentFactory.buildList(3, { decision: 'rejected' })
    const awaitingAssessments = assessmentFactory.buildList(5, { decision: undefined })

    assessmentClient.all.mockResolvedValue([acceptedAssessments, rejectedAssessments, awaitingAssessments].flat())
    personClient.risks.mockResolvedValue(risks)

    const result = await service.getAllForLoggedInUser('token')

    const assessmentWithRisks = (assessments: Array<Assessment>) => {
      return assessments.map(assessment => {
        return {
          ...assessment,
          application: { ...assessment.application, person: { ...assessment.application.person, risks } },
        }
      })
    }

    expect(result).toEqual({
      completed: [assessmentWithRisks(acceptedAssessments), assessmentWithRisks(rejectedAssessments)].flat(),
      requestedFurtherInformation: [],
      awaiting: assessmentWithRisks(awaitingAssessments),
    })
  })
})
