import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import { assessmentFactory } from '../../testutils/factories'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

describe('decisionUtils', () => {
  describe('decisionFromAssessment', () => {
    const assessment = assessmentFactory.build()

    it('returns the decision from the assessment if it exists', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('the decision')

      expect(decisionFromAssessment(assessment)).toEqual('the decision')
    })

    it('returns an empty string of the decision doesnt exist', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue(undefined)

      expect(decisionFromAssessment(assessment)).toEqual('')
    })
  })

  describe('applicationAccepted', () => {
    const acceptedAssessment = assessmentFactory.build()
    const rejectedAssessment = assessmentFactory.build()
    const assessmentWithNoDecision = assessmentFactory.build()

    beforeEach(() => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockImplementation((assessment: Assessment) => {
        if (assessment === acceptedAssessment) {
          return 'accept'
        }

        if (assessment === rejectedAssessment) {
          return 'riskTooHigh'
        }

        return undefined
      })
    })

    it('returns true if the assessment has the response "accept"', () => {
      expect(applicationAccepted(acceptedAssessment)).toBe(true)
    })

    it('returns false if the assessment has any other decision', () => {
      expect(applicationAccepted(rejectedAssessment)).toBe(false)
    })

    it('returns false if the assessment has no decision', () => {
      expect(applicationAccepted(assessmentWithNoDecision)).toBe(false)
    })
  })
})
