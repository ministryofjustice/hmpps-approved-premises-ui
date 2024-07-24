import { PlacementRequest, PlacementRequestDetail } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { sentenceCase } from '../utils'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'
import { placementCriteriaLabels } from '../placementCriteriaUtils'

export const matchingInformationSummary = (placementRequest: PlacementRequestDetail): SummaryListWithCard => {
  const rows = []

  const preferredAps = preferredApsRow(placementRequest)

  if (preferredAps) {
    rows.push(preferredAps)
  }

  rows.push(placementRequirementsRow(placementRequest, 'essential'))
  rows.push(placementRequirementsRow(placementRequest, 'desirable'))

  if (placementRequest.notes) {
    rows.push({
      key: {
        text: 'Observations from assessor',
      },
      value: {
        text: placementRequest.notes,
      },
    })
  }

  return {
    card: {
      title: {
        text: 'Information for Matching',
      },
    },
    rows,
  }
}

export const preferredApsRow = (placementRequest: PlacementRequestDetail): SummaryListItem | undefined => {
  const premises = getPreferredApsFromApplication(placementRequest)

  if (premises.length) {
    const apList = premises.map(p => `<li>${p.name}</li>`)
    return {
      key: { text: 'Preferred APs' },
      value: { html: `<ol class="govuk-list govuk-list--number">${apList.join('')}</ol>` },
    }
  }

  return undefined
}

export const mapSearchParamCharacteristicsForUi = (characteristics: Array<string>) => {
  return `<ul class="govuk-list">${characteristics
    .map(characteristicPair => `<li>${placementCriteriaLabels[characteristicPair]}</li>`)
    .join('')}</ul>`
}

export const placementRequirementsRow = (
  placementRequest: PlacementRequest,
  type: 'desirable' | 'essential',
): SummaryListItem => {
  const criteria = type === 'essential' ? placementRequest.essentialCriteria : placementRequest.desirableCriteria
  return {
    key: {
      text: `${sentenceCase(type)} Criteria`,
    },
    value: {
      html: mapSearchParamCharacteristicsForUi(criteria),
    },
  }
}
