import { placementRequestFactory } from '../../testutils/factories'
import { documentSummary, documentSummaryRow } from './documentSummaryList'

describe('documentSummaryList', () => {
  describe('documentSummary', () => {
    it('returns a summary of the documents', () => {
      const placementRequest = placementRequestFactory.build()

      expect(documentSummary(placementRequest)).toEqual({
        card: {
          title: {
            text: 'Documents',
          },
        },
        rows: [documentSummaryRow(placementRequest, 'application'), documentSummaryRow(placementRequest, 'assessment')],
      })
    })
  })

  describe('documentSummaryRow', () => {
    it('returns an assessment row', () => {
      const placementRequest = placementRequestFactory.build()

      expect(documentSummaryRow(placementRequest, 'assessment')).toEqual({
        key: {
          text: 'Assessment',
        },
        value: {
          html: `<a href="/assessments/${placementRequest.assessmentId}" >View document <span class="govuk-visually-hidden">(assessment)</span></a>`,
        },
      })
    })

    it('returns an application row', () => {
      const placementRequest = placementRequestFactory.build()

      expect(documentSummaryRow(placementRequest, 'application')).toEqual({
        key: {
          text: 'Application',
        },
        value: {
          html: `<a href="/applications/${placementRequest.applicationId}" >View document <span class="govuk-visually-hidden">(application)</span></a>`,
        },
      })
    })
  })
})
