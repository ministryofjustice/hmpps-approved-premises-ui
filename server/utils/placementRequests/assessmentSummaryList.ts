import { PlacementRequest } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { sentenceCase } from '../utils'

export const assessmentSummary = (placementRequest: PlacementRequest): SummaryListWithCard => {
  return {
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
  }
}

export const assessmentOutcomeRow = (placementRequest: PlacementRequest): SummaryListItem => {
  return {
    key: {
      text: 'Assessment Outcome',
    },
    value: {
      text: sentenceCase(placementRequest.assessmentDecision),
    },
  }
}

export const assessmentDateRow = (placementRequest: PlacementRequest): SummaryListItem => {
  return {
    key: {
      text: 'Date of assessment',
    },
    value: {
      text: DateFormats.isoDateToUIDate(placementRequest.assessmentDate),
    },
  }
}

export const assessorDetailsRow = (placementRequest: PlacementRequest): SummaryListItem => {
  const html = [
    placementRequest.assessor.name,
    placementRequest.assessor.email,
    placementRequest.assessor.telephoneNumber,
  ]
    .filter(n => n)
    .join('<br />')

  return {
    key: {
      text: 'Assessor Details',
    },
    value: {
      html,
    },
  }
}
