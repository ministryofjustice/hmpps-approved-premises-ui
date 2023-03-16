import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import assessmentFactory from '../../testutils/factories/assessment'

describe('decisionUtils', () => {
  describe('decisionFromAssessment', () => {
    it('returns the decision from the assessment if it exists', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'the decision' } } },
      })
      expect(decisionFromAssessment(assessment)).toEqual('the decision')
    })

    it('returns an empty string of the decision doesnt exist', () => {
      const assessment = assessmentFactory.build({ data: {} })
      expect(decisionFromAssessment(assessment)).toEqual('')
    })
  })

  describe('applicationAccepted', () => {
    it('returns true if the assessment has either of the two decisions which accept an applicaiton', () => {
      const acceptedAssessment1 = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
      })
      const acceptedAssessment2 = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
      })

      expect(applicationAccepted(acceptedAssessment1)).toBe(true)
      expect(applicationAccepted(acceptedAssessment2)).toBe(true)
    })

    it('returns false if the assessment has any other decision', () => {
      const rejectedAssessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'reject' } } },
      })

      expect(applicationAccepted(rejectedAssessment)).toBe(false)
    })

    it('returns false if the assessment has no decision', () => {
      const rejectedAssessment = assessmentFactory.build()

      expect(applicationAccepted(rejectedAssessment)).toBe(false)
    })
  })
})
