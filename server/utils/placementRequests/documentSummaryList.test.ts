import { placementRequestFactory } from '../../testutils/factories'
import { applicationLink } from './applicationLink'
import { documentSummary, documentSummaryRow } from './documentSummaryList'
import { assessmentLink } from './utils'

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
          html: assessmentLink(placementRequest, 'View document', '(assessment)'),
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
          html: applicationLink(placementRequest, 'View document', '(application)'),
        },
      })
    })
  })
})
