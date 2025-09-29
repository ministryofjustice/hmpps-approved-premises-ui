import { NewPlacementFormData } from '@approved-premises/ui'
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

type NewPlacementFormErrors = {
  [K in keyof NewPlacementFormData]?: string
}

export const validateNewPlacement = (body: Partial<NewPlacementFormData>) => {
  const errors: NewPlacementFormErrors = {}

  const startDate = DateFormats.datepickerInputToIsoString(body.startDate)
  const endDate = DateFormats.datepickerInputToIsoString(body.endDate)
  const today = DateFormats.dateObjToIsoDate(new Date())

  if (!startDate) {
    errors.startDate = 'Enter or select an arrival date'
  } else if (!isoDateIsValid(startDate)) {
    errors.startDate = 'Enter a valid arrival date'
  } else if (startDate <= today) {
    errors.startDate = 'The arrival date must be in the future'
  }

  if (!endDate) {
    errors.endDate = 'Enter or select a departure date'
  } else if (!isoDateIsValid(endDate)) {
    errors.endDate = 'Enter a valid departure date'
  } else if (endDate <= today) {
    errors.endDate = 'The departure date must be in the future'
  } else if (!errors.startDate && endDate <= startDate) {
    errors.endDate = 'The departure date must be after the arrival date'
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
