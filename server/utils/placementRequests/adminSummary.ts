import { PlacementRequestDetail } from '../../@types/shared'
import { SummaryList } from '../../@types/ui'
import { allApTypes } from '../allAPTypes'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { DateFormats } from '../dateUtils'
import { placementDates, placementLength } from '../matchUtils'

export const adminSummary = (placementRequest: PlacementRequestDetail): SummaryList => {
  const dates = placementDates(placementRequest.expectedArrival, String(placementRequest.duration))
  return {
    rows: [
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
    ],
  }
}

export const apTypeCell = (placementRequest: PlacementRequestDetail) => {
  return {
    key: {
      text: 'Type of AP',
    },
    value: {
      text: allApTypes[placementRequest.type],
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
