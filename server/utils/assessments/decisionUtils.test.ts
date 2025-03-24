import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { applicationAccepted, decisionFromAssessment, notEnoughInformationFromAssessment } from './decisionUtils'
import { assessmentFactory } from '../../testutils/factories'
import * as retrievalFunctions from '../retrieveQuestionResponseFromFormArtifact'

describe('decisionUtils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('decisionFromAssessment', () => {
    const assessment = assessmentFactory.build()

    it('returns the decision from the assessment if it exists', () => {
      jest.spyOn(retrievalFunctions, 'retrieveOptionalQuestionResponseFromFormArtifact').mockReturnValue('the decision')

      expect(decisionFromAssessment(assessment)).toEqual('the decision')
    })

    it('returns an empty string of the decision doesnt exist', () => {
      jest.spyOn(retrievalFunctions, 'retrieveOptionalQuestionResponseFromFormArtifact').mockReturnValue(undefined)

      expect(decisionFromAssessment(assessment)).toEqual('')
    })
  })

  describe('applicationAccepted', () => {
    const acceptedAssessment = assessmentFactory.build()
    const rejectedAssessment = assessmentFactory.build()
    const assessmentWithNoDecision = assessmentFactory.build()

    beforeEach(() => {
      jest
        .spyOn(retrievalFunctions, 'retrieveOptionalQuestionResponseFromFormArtifact')
        .mockImplementation((assessment: Assessment) => {
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

  describe('notEnoughInformationFromAssessment', () => {
    beforeEach(() => {
      jest
        .spyOn(retrievalFunctions, 'retrieveOptionalQuestionResponseFromFormArtifact')
        .mockImplementation((assessment: Assessment, _, question) => {
          return assessment.data[question]
        })
    })

    it('should return true if there is insufficient information and no information received', () => {
      const assessment = assessmentFactory.build({
        data: {
          sufficientInformation: 'no',
          informationReceived: 'no',
        },
      })
      expect(notEnoughInformationFromAssessment(assessment)).toEqual(true)
    })
    it.each([
      ['no data - false', [undefined, undefined], false],
      ['Insufficient, no data received - true', ['no', 'no'], true],
      ['insufficient, not received - false', ['no', undefined], false],
      ['insufficient, received - false', ['no', 'yes'], false],
    ])('should return %s ', (_, [sufficientInformation, informationReceived], expected) => {
      const assessment = assessmentFactory.build({
        data: {
          sufficientInformation,
          informationReceived,
        },
      })
      expect(notEnoughInformationFromAssessment(assessment)).toEqual(expected)
    })
  })
})
