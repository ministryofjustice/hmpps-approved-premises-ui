import { SpaceSearchFormData, SummaryList } from '@approved-premises/ui'
import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { ValidationError } from '../errors'
import { DateFormats, isoDateIsValid } from '../dateUtils'
import { summaryListItem } from '../formUtils'
import { applyApTypeToAssessApType, apTypeCriteriaLabels, type ApTypeSpecialist } from '../placementCriteriaUtils'
import {
  characteristicsBulletList,
  roomCharacteristicMap,
  spaceSearchCriteriaApLevelLabels,
} from '../characteristicsUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from './spaceSearch'

type NewPlacementForm = {
  newPlacementArrivalDate: string
  newPlacementDepartureDate: string
  newPlacementReason: string
}

type NewPlacementFormErrors = {
  [K in keyof NewPlacementForm]?: string
}

export const validateNewPlacement = (body: Partial<NewPlacementForm>) => {
  const errors: NewPlacementFormErrors = {}

  const startDate = DateFormats.datepickerInputToIsoString(body.newPlacementArrivalDate)
  const endDate = DateFormats.datepickerInputToIsoString(body.newPlacementDepartureDate)
  const today = DateFormats.dateObjToIsoDate(new Date())

  if (!startDate) {
    errors.newPlacementArrivalDate = 'Enter or select an arrival date'
  } else if (!isoDateIsValid(startDate)) {
    errors.newPlacementArrivalDate = 'Enter a valid arrival date'
  } else if (startDate <= today) {
    errors.newPlacementArrivalDate = 'The arrival date must be in the future'
  }

  if (!endDate) {
    errors.newPlacementDepartureDate = 'Enter or select a departure date'
  } else if (!isoDateIsValid(endDate)) {
    errors.newPlacementDepartureDate = 'Enter a valid departure date'
  } else if (endDate <= today) {
    errors.newPlacementDepartureDate = 'The departure date must be in the future'
  } else if (!errors.newPlacementArrivalDate && endDate <= startDate) {
    errors.newPlacementDepartureDate = 'The departure date must be after the arrival date'
  }

  if (!body.newPlacementReason) {
    errors.newPlacementReason = 'Enter a reason'
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(errors)
  }
}

export const criteriaSummaryList = (placementRequest: Cas1PlacementRequestDetail) => ({
  rows: [
    summaryListItem(
      'AP type',
      apTypeCriteriaLabels[applyApTypeToAssessApType[placementRequest.type as ApTypeSpecialist] || 'normal'],
    ),
    summaryListItem(
      'AP criteria',
      characteristicsBulletList(filterApLevelCriteria(placementRequest.essentialCriteria), {
        labels: spaceSearchCriteriaApLevelLabels,
      }),
      'html',
    ),
    summaryListItem(
      'Room criteria',
      characteristicsBulletList(filterRoomLevelCriteria(placementRequest.essentialCriteria), {
        labels: roomCharacteristicMap,
      }),
      'html',
    ),
  ],
})

export const newPlacementSummaryList = (
  searchState: SpaceSearchFormData,
  currentPlacement?: Cas1SpaceBookingSummary,
): SummaryList => {
  if (!searchState.newPlacementReason) return undefined

  const arrivalDateIso = DateFormats.datepickerInputToIsoString(searchState.newPlacementArrivalDate)
  const departureDateIso = DateFormats.datepickerInputToIsoString(searchState.newPlacementDepartureDate)

  return {
    rows: [
      currentPlacement && summaryListItem('Current AP', currentPlacement.premises.name),
      summaryListItem('Expected arrival date', arrivalDateIso, 'date'),
      summaryListItem('Expected departure date', departureDateIso, 'date'),
      summaryListItem(
        'Length of stay',
        DateFormats.formatDuration(DateFormats.durationBetweenDates(arrivalDateIso, departureDateIso).number),
      ),
      summaryListItem('Type of AP', apTypeCriteriaLabels[searchState.apType]),
      summaryListItem(
        'AP requirements',
        characteristicsBulletList(searchState.apCriteria, { labels: spaceSearchCriteriaApLevelLabels }),
        'html',
      ),
      summaryListItem(
        'Room requirements',
        characteristicsBulletList(searchState.roomCriteria, { labels: roomCharacteristicMap }),
        'html',
      ),
      summaryListItem('Reason', searchState.newPlacementReason, 'textBlock'),
    ].filter(Boolean),
  }
}
