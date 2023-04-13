import { PlacementRequest } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'
import { linkTo, sentenceCase } from '../utils'

export const documentSummary = (placementRequest: PlacementRequest): SummaryListWithCard => {
  return {
    card: {
      title: {
        text: 'Documents',
      },
    },
    rows: [documentSummaryRow(placementRequest, 'application'), documentSummaryRow(placementRequest, 'assessment')],
  }
}

export const documentSummaryRow = (
  placementRequest: PlacementRequest,
  type: 'assessment' | 'application',
): SummaryListItem => {
  const linkText = `View document`
  const hiddenText = `(${type})`
  const link =
    type === 'application'
      ? linkTo(applyPaths.applications.show, { id: placementRequest.applicationId }, { text: linkText, hiddenText })
      : linkTo(assessPaths.assessments.show, { id: placementRequest.assessmentId }, { text: linkText, hiddenText })

  return {
    key: {
      text: sentenceCase(type),
    },
    value: {
      html: link,
    },
  }
}
