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
import { newPlacementReasons } from '.'

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

  if (!startDate) {
    errors.newPlacementArrivalDate = 'Enter or select an expected arrival date'
  } else if (!isoDateIsValid(startDate)) {
    errors.newPlacementArrivalDate = 'Enter a valid expected arrival date'
  }

  if (!endDate) {
    errors.newPlacementDepartureDate = 'Enter or select an expected departure date'
  } else if (!isoDateIsValid(endDate)) {
    errors.newPlacementDepartureDate = 'Enter a valid expected departure date'
  } else if (!errors.newPlacementArrivalDate && endDate <= startDate) {
    errors.newPlacementDepartureDate = 'The expected departure date must be after the expected arrival date'
  }

  if (!body.newPlacementReason) {
    errors.newPlacementReason = 'Select a transfer reason'
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
  {
    apType,
    apCriteria,
    roomCriteria,
    newPlacementArrivalDate,
    newPlacementDepartureDate,
    newPlacementReason,
    newPlacementNotes,
  }: SpaceSearchFormData,
  currentPlacement?: Cas1SpaceBookingSummary,
): SummaryList => {
  if (!newPlacementReason) return undefined

  const arrivalDateIso = DateFormats.datepickerInputToIsoString(newPlacementArrivalDate)
  const departureDateIso = DateFormats.datepickerInputToIsoString(newPlacementDepartureDate)

  return {
    rows: [
      currentPlacement && summaryListItem('Current Approved Premises', currentPlacement.premises.name),
      summaryListItem('Expected arrival date', arrivalDateIso, 'date'),
      summaryListItem('Expected departure date', departureDateIso, 'date'),
      summaryListItem(
        'Length of stay',
        DateFormats.formatDuration(DateFormats.durationBetweenDates(arrivalDateIso, departureDateIso).number),
      ),
      summaryListItem('Type of AP', apTypeCriteriaLabels[apType]),
      summaryListItem(
        'AP requirements',
        characteristicsBulletList(apCriteria, { labels: spaceSearchCriteriaApLevelLabels }),
        'html',
      ),
      summaryListItem(
        'Room requirements',
        characteristicsBulletList(roomCriteria, { labels: roomCharacteristicMap }),
        'html',
      ),
      newPlacementReason &&
        summaryListItem('Reason for transfer', newPlacementReasons[newPlacementReason], 'textBlock'),
      newPlacementNotes && summaryListItem('Additional information', newPlacementNotes, 'textBlock'),
    ].filter(Boolean),
  }
}
