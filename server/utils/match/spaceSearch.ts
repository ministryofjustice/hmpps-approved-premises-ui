import {
  Cas1PlacementRequestDetail,
  Cas1SpaceCharacteristic,
  Cas1SpaceSearchParameters,
  Cas1SpaceSearchResult as SpaceSearchResult,
  Cas1SpaceSearchResult,
  PlacementCriteria,
} from '@approved-premises/api'
import {
  CheckBoxItem,
  RadioItem,
  SpaceSearchApCriteria,
  SpaceSearchFormData,
  SpaceSearchRoomCriteria,
  SummaryListItem,
} from '@approved-premises/ui'
import { filterByType } from '../utils'
import {
  applyApTypeToAssessApType,
  ApTypeCriteria,
  apTypeCriteriaLabels,
  type ApTypeSpecialist,
} from '../placementCriteriaUtils'
import { convertKeyValuePairToRadioItems, summaryListItem } from '../formUtils'
import { roomCharacteristicMap } from '../characteristicsUtils'
import { spaceSearchCriteriaApLevelLabels } from './spaceSearchLabels'
import { addressRow, apTypeRow, characteristicsDetails, distanceRow, restrictionsRow } from '.'

export const initialiseSearchState = (placementRequest: Cas1PlacementRequestDetail): SpaceSearchFormData => {
  return {
    applicationId: placementRequest.applicationId,
    postcode: placementRequest.location,
    apType: applyApTypeToAssessApType[placementRequest.type as ApTypeSpecialist] || 'normal',
    apCriteria: filterApLevelCriteria(placementRequest.essentialCriteria),
    roomCriteria: filterRoomLevelCriteria(placementRequest.essentialCriteria),
    startDate: placementRequest.authorisedPlacementPeriod.arrival,
    durationDays: placementRequest.authorisedPlacementPeriod.duration,
  }
}

export const filterApLevelCriteria = (criteria: Array<PlacementCriteria | Cas1SpaceCharacteristic>) =>
  Object.keys(filterByType(criteria, spaceSearchCriteriaApLevelLabels)) as Array<SpaceSearchApCriteria>

export const filterRoomLevelCriteria = (criteria: Array<PlacementCriteria | Cas1SpaceCharacteristic>) =>
  Object.keys(filterByType(criteria, roomCharacteristicMap)) as Array<SpaceSearchRoomCriteria>

export const spaceSearchStateToApiPayload = (state: SpaceSearchFormData): Cas1SpaceSearchParameters => {
  return {
    applicationId: state.applicationId,
    startDate: state.startDate,
    targetPostcodeDistrict: state.postcode,
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

export const summaryCardRows = (
  spaceSearchResult: SpaceSearchResult,
  postcodeArea: string,
  isWomensApplication = false,
): Array<SummaryListItem> =>
  [
    apTypeRow(spaceSearchResult.premises.apType),
    !isWomensApplication && summaryListItem('AP area', spaceSearchResult.premises.apArea.name),
    addressRow(spaceSearchResult),
    distanceRow(spaceSearchResult, postcodeArea),
    restrictionsRow(spaceSearchResult),
  ].filter(Boolean)

export const summaryCards = (
  spaceSearchResult: Array<Cas1SpaceSearchResult>,
  postcode: string,
  isWomensApplication: boolean,
) => {
  return spaceSearchResult.map((result: Cas1SpaceSearchResult) => {
    return {
      spaceSearchResult: result,
      summaryCardRows: summaryCardRows(result, postcode, isWomensApplication),
      characteristicsHtml: characteristicsDetails(result),
    }
  })
}
