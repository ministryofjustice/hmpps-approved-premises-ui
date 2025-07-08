import { cas1PlacementRequestDetailFactory, userFactory } from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { assessmentDateRow, assessmentOutcomeRow, assessmentSummary, assessorDetailsRow } from './assessmentSummaryList'

describe('assessmentSummaryList', () => {
  describe('assessmentSummary', () => {
    it('returns a summary of the assessment', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build()

      expect(assessmentSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Assessment Information',
          },
        },
        rows: [
          assessmentOutcomeRow(placementRequest),
          assessmentDateRow(placementRequest),
          assessorDetailsRow(placementRequest),
        ],
      })
    })
  })

  describe('assessmentOutcomeRow', () => {
    it('returns the outcome in sentence case', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build({ assessmentDecision: 'accepted' })

      expect(assessmentOutcomeRow(placementRequest)).toEqual({
        key: {
          text: 'Assessment Outcome',
        },
        value: {
          text: 'Accepted',
        },
      })
    })
  })

  describe('assessmentDateRow', () => {
    it('returns the outcome in sentence case', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.build()

      expect(assessmentDateRow(placementRequest)).toEqual({
        key: {
          text: 'Date of assessment',
        },
        value: {
          text: DateFormats.isoDateToUIDate(placementRequest.assessmentDate),
        },
      })
    })
  })

  describe('assessorDetailsRow', () => {
    it(`returns all of the assessor's details if present`, () => {
      const assessor = userFactory.build({
        name: 'Bruce Wayne',
        telephoneNumber: '12345',
        email: 'bruce@example.com',
      })
      const placementRequest = cas1PlacementRequestDetailFactory.build({ assessor })

      expect(assessorDetailsRow(placementRequest)).toEqual({
        key: {
          text: 'Assessor Details',
        },
        value: {
          html: `Bruce Wayne<br />bruce@example.com<br />12345`,
        },
      })
    })

    it('filters out any empty values', () => {
      const assessor = userFactory.build({
        name: 'Bruce Wayne',
        telephoneNumber: undefined,
        email: 'bruce@example.com',
      })
      const placementRequest = cas1PlacementRequestDetailFactory.build({ assessor })

      expect(assessorDetailsRow(placementRequest)).toEqual({
        key: {
          text: 'Assessor Details',
        },
        value: {
          html: `Bruce Wayne<br />bruce@example.com`,
        },
      })
    })
  })
})
