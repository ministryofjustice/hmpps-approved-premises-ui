import {
  Cas1SpaceCharacteristic,
  Cas1SpaceSearchParameters,
  PlacementCriteria,
  PlacementRequestDetail,
} from '@approved-premises/api'
import { CheckBoxItem, RadioItem } from '@approved-premises/ui'
import { filterByType } from '../utils'
import {
  ApTypeCriteria,
  type ApTypeSpecialist,
  apTypeCriteriaLabels,
  applyApTypeToAssessApType,
  placementCriteriaLabels,
} from '../placementCriteriaUtils'
import { convertKeyValuePairToRadioItems } from '../formUtils'
import { roomCharacteristicMap } from '../characteristicsUtils'

export const spaceSearchCriteriaApLevelLabels = {
  acceptsSexOffenders: 'Sexual offences against adults',
  acceptsChildSexOffenders: 'Sexual offences against children',
  acceptsNonSexualChildOffenders: 'Non-sexual offences against children',
  isSuitableForVulnerable: 'Vulnerable to exploitation (removes ESAP APs)',
  isCatered: 'Catered',
} as const

export type SpaceSearchApCriteria = keyof typeof spaceSearchCriteriaApLevelLabels

export type SpaceSearchRoomCriteria = keyof typeof roomCharacteristicMap

export const spaceSearchResultsCharacteristicsLabels = {
  ...spaceSearchCriteriaApLevelLabels,
  ...roomCharacteristicMap,
  isSuitableForVulnerable: placementCriteriaLabels.isSuitableForVulnerable,
} as const

export type SpaceSearchState = {
  applicationId: string
  postcode: string
  apType: ApTypeCriteria
  apCriteria: Array<SpaceSearchApCriteria>
  roomCriteria: Array<SpaceSearchRoomCriteria>
  startDate: string
  durationDays: number
  arrivalDate?: string
  departureDate?: string
}

export const initialiseSearchState = (placementRequest: PlacementRequestDetail): SpaceSearchState => {
  const allCriteria = [...placementRequest.essentialCriteria, ...placementRequest.desirableCriteria]

  return {
    applicationId: placementRequest.applicationId,
    postcode: placementRequest.location,
    apType: applyApTypeToAssessApType[placementRequest.type as ApTypeSpecialist] || 'normal',
    apCriteria: filterApLevelCriteria(allCriteria),
    roomCriteria: filterRoomLevelCriteria(allCriteria),
    startDate: placementRequest.expectedArrival,
    durationDays: placementRequest.duration,
  }
}

export const filterApLevelCriteria = (criteria: Array<PlacementCriteria | Cas1SpaceCharacteristic>) =>
  Object.keys(filterByType(criteria, spaceSearchCriteriaApLevelLabels)) as Array<SpaceSearchApCriteria>

export const filterRoomLevelCriteria = (criteria: Array<PlacementCriteria | Cas1SpaceCharacteristic>) =>
  Object.keys(filterByType(criteria, roomCharacteristicMap)) as Array<SpaceSearchRoomCriteria>

export const spaceSearchStateToApiPayload = (state: SpaceSearchState): Cas1SpaceSearchParameters => {
  return {
    applicationId: state.applicationId,
    startDate: state.startDate,
    targetPostcodeDistrict: state.postcode,
    requirements: {},
    spaceCharacteristics: [
      state.apType !== 'normal' ? (state.apType as Cas1SpaceCharacteristic) : undefined,
      ...state.apCriteria,
      ...state.roomCriteria,
    ].filter(Boolean),
    durationInDays: state.durationDays,
  }
}

export const apTypeRadioItems = (selectedValue: ApTypeCriteria) => {
  const apTypeRadios = convertKeyValuePairToRadioItems(apTypeCriteriaLabels, selectedValue) as Array<
    RadioItem | { divider: 'or' }
  >
  apTypeRadios.splice(1, 0, { divider: 'or' })

  return apTypeRadios
}

type CheckboxGroup = {
  legend: string
  fieldName: string
  items: Array<CheckBoxItem>
}

export const checkBoxesForCriteria = (
  legend: string,
  fieldName: string,
  criteria: Record<string, string>,
  selectedValues: Array<string> = [],
): CheckboxGroup => {
  return {
    legend,
    fieldName,
    items: Object.entries(criteria).map(([value, label]) => ({
      id: value,
      text: label,
      value,
      checked: selectedValues.includes(value),
    })),
  }
}
