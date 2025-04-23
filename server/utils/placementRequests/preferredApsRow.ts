import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryListItem } from '../../@types/ui'
import { getPreferredApsFromApplication } from './getPreferredApsFromApplication'

export const preferredApsRow = (placementRequest: Cas1PlacementRequestDetail): SummaryListItem | undefined => {
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
