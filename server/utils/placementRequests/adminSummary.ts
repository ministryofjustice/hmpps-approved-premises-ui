import { apTypeLongLabels } from '../apTypeLabels'
import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryList, SummaryListItem } from '../../@types/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { withdrawnStatusTag } from '../applications/utils'
import { DateFormats } from '../dateUtils'
import { placementDates, placementLength } from '../match'
import paths from '../../paths/apply'

export const adminSummary = (placementRequest: Cas1PlacementRequestDetail): SummaryList => {
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
        text: placementRequest.isParole ? 'Estimated arrival date' : 'Requested Arrival Date',
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

export const apTypeCell = (placementRequest: Cas1PlacementRequestDetail) => {
  return {
    key: {
      text: 'Type of AP',
    },
    value: {
      text: apTypeLongLabels[placementRequest.type],
    },
    actions: {
      items: [
        {
          href: `${paths.applications.show({ id: placementRequest.applicationId })}?tab=timeline`,
          text: 'View timeline',
        },
      ],
    },
  }
}

export const releaseTypeCell = (placementRequest: Cas1PlacementRequestDetail) => {
  return {
    key: {
      text: 'Release Type',
    },
    value: {
      text: allReleaseTypes[placementRequest.releaseType],
    },
  }
}
