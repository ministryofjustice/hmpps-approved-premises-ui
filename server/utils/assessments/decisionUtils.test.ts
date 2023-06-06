import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import { assessmentFactory } from '../../testutils/factories'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('decisionUtils', () => {
  describe('decisionFromAssessment', () => {
    const assessment = assessmentFactory.build()

    it('returns the decision from the assessment if it exists', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue('the decision')

      expect(decisionFromAssessment(assessment)).toEqual('the decision')
    })

    it('returns an empty string of the decision doesnt exist', () => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValue(undefined)

      expect(decisionFromAssessment(assessment)).toEqual('')
    })
  })

  describe('applicationAccepted', () => {
    const acceptedAssessment1 = assessmentFactory.build()
    const acceptedAssessment2 = assessmentFactory.build()
    const rejectedAssessment = assessmentFactory.build()
    const assessmentWithNoDecision = assessmentFactory.build()

    beforeEach(() => {
      ;(retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.Mock).mockImplementation(
        (assessment: Assessment) => {
          if (assessment === acceptedAssessment1) {
            return 'releaseDate'
          }

          if (assessment === acceptedAssessment2) {
            return 'hold'
          }

          if (assessment === rejectedAssessment) {
            return 'riskTooHigh'
          }

          return undefined
        },
      )
    })

    it('returns true if the assessment has either of the two decisions which accept an applicaiton', () => {
      expect(applicationAccepted(acceptedAssessment1)).toBe(true)
      expect(applicationAccepted(acceptedAssessment2)).toBe(true)
    })

    it('returns false if the assessment has any other decision', () => {
      expect(applicationAccepted(rejectedAssessment)).toBe(false)
    })

    it('returns false if the assessment has no decision', () => {
      expect(applicationAccepted(assessmentWithNoDecision)).toBe(false)
    })
  })
})
