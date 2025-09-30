import { SpaceSearchFormData, SummaryList } from '@approved-premises/ui'
import { Cas1PlacementRequestDetail } from '@approved-premises/api'
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
  arrivalDate: string
  departureDate: string
  reason: string
}

type NewPlacementFormErrors = {
  [K in keyof NewPlacementForm]?: string
}

export const validateNewPlacement = (body: Partial<NewPlacementForm>) => {
  const errors: NewPlacementFormErrors = {}

  const startDate = DateFormats.datepickerInputToIsoString(body.arrivalDate)
  const endDate = DateFormats.datepickerInputToIsoString(body.departureDate)
  const today = DateFormats.dateObjToIsoDate(new Date())

  if (!startDate) {
    errors.arrivalDate = 'Enter or select an arrival date'
  } else if (!isoDateIsValid(startDate)) {
    errors.arrivalDate = 'Enter a valid arrival date'
  } else if (startDate <= today) {
    errors.arrivalDate = 'The arrival date must be in the future'
  }

  if (!endDate) {
    errors.departureDate = 'Enter or select a departure date'
  } else if (!isoDateIsValid(endDate)) {
    errors.departureDate = 'Enter a valid departure date'
  } else if (endDate <= today) {
    errors.departureDate = 'The departure date must be in the future'
  } else if (!errors.arrivalDate && endDate <= startDate) {
    errors.departureDate = 'The departure date must be after the arrival date'
  }

  if (!body.reason) {
    errors.reason = 'Enter a reason'
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

export const newPlacementSummaryList = (searchState: SpaceSearchFormData): SummaryList =>
  searchState.newPlacementReason
    ? {
        rows: [
          summaryListItem('Expected arrival date', searchState.arrivalDate, 'date'),
          summaryListItem('Expected departure date', searchState.departureDate, 'date'),
          summaryListItem(
            'Length of stay',
            DateFormats.formatDuration(
              DateFormats.durationBetweenDates(
                DateFormats.isoToDateObj(searchState.departureDate),
                DateFormats.isoToDateObj(searchState.arrivalDate),
              ).number,
            ),
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
        ],
      }
    : undefined
