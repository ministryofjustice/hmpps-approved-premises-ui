import { apTypeLabels } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import { PlacementRequestDetail } from '../../@types/shared'
import { SummaryList, SummaryListItem } from '../../@types/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { withdrawnStatusTag } from '../applications/utils'
import { DateFormats } from '../dateUtils'
import { placementDates, placementLength } from '../matchUtils'

export const adminSummary = (placementRequest: PlacementRequestDetail): SummaryList => {
  const dates = placementDates(placementRequest.expectedArrival, String(placementRequest.duration))

  const rows: Array<SummaryListItem> = [
    {
      key: {
        text: 'CRN',
      },
      value: {
        text: placementRequest.person.crn,
      },
    },
    {
      key: {
        text: 'Tier',
      },
      value: {
        text: placementRequest.risks?.tier?.value?.level || 'N/A',
      },
    },
    {
      key: {
        text: placementRequest.isParole ? 'Date of decision' : 'Requested Arrival Date',
      },
      value: {
        text: DateFormats.isoDateToUIDate(dates.startDate),
      },
    },
    {
      key: {
        text: 'Requested Departure Date',
      },
      value: {
        text: DateFormats.isoDateToUIDate(dates.endDate),
      },
    },
    {
      key: {
        text: 'Length of stay',
      },
      value: {
        text: placementLength(dates.placementLength),
      },
    },
    apTypeCell(placementRequest),
    releaseTypeCell(placementRequest),
  ]

  if (placementRequest.isWithdrawn) {
    rows.push(withdrawnStatusTag)
  }

  return { rows }
}

export const apTypeCell = (placementRequest: PlacementRequestDetail) => {
  return {
    key: {
      text: 'Type of AP',
    },
    value: {
      text: apTypeLabels[placementRequest.type],
    },
  }
}

export const releaseTypeCell = (placementRequest: PlacementRequestDetail) => {
  return {
    key: {
      text: 'Release Type',
    },
    value: {
      text: allReleaseTypes[placementRequest.releaseType],
    },
  }
}
