import { WithdrawPlacementRequestReason } from '../../../@types/shared/models/WithdrawPlacementRequestReason'
import { RadioItem } from '../../../@types/ui'
import { convertKeyValuePairToRadioItems } from '../../formUtils'

const withdrawalReasons: Record<WithdrawPlacementRequestReason, string> = {
  AlternativeProvisionIdentified: 'Another provision has been identified',
  ChangeInCircumstances: 'Their circumstances changed',
  ChangeInReleaseDecision: 'The release decision changed',
  NoCapacityDueToLostBed: "There's no capacity due to a lost bed",
  NoCapacityDueToPlacementPrioritisation: "There's no capacity due to placement prioritisation",
  NoCapacity: "There's no capacity",
  ErrorInPlacementRequest: 'There was an error in the request',
  DuplicatePlacementRequest: 'The request was a duplicate',
}

const placementNoLongerNeededReasons = [
  'AlternativeProvisionIdentified',
  'ChangeInCircumstances',
  'ChangeInReleaseDecision',
] as const

const noCapacityReasons = ['NoCapacityDueToLostBed', 'NoCapacityDueToPlacementPrioritisation', 'NoCapacity'] as const

const problemInPlacementReasons = ['ErrorInPlacementRequest', 'DuplicatePlacementRequest'] as const

type PlacementNoLongerNeededReasons = Extract<
  WithdrawPlacementRequestReason,
  (typeof placementNoLongerNeededReasons)[number]
>

type NoCapacityReasons = Extract<WithdrawPlacementRequestReason, (typeof noCapacityReasons)[number]>

type ProblemInPlacementReasons = Extract<WithdrawPlacementRequestReason, (typeof problemInPlacementReasons)[number]>

const filterByType = <T extends WithdrawPlacementRequestReason>(keys: Readonly<Array<string>>): Record<T, string> => {
  return Object.keys(withdrawalReasons)
    .filter(k => keys.includes(k))
    .reduce((criteria, key) => ({ ...criteria, [key]: withdrawalReasons[key] }), {}) as Record<T, string>
}

const placementNoLongerNeededOptions = filterByType<PlacementNoLongerNeededReasons>(placementNoLongerNeededReasons)
const noCapacityOptions = filterByType<NoCapacityReasons>(noCapacityReasons)
const problemInPlacementOptions = filterByType<ProblemInPlacementReasons>(problemInPlacementReasons)

export const placementApplicationWithdrawalReasons = (
  selectedReason: WithdrawPlacementRequestReason,
): Array<RadioItem | { divider: string }> => {
  return [
    { divider: 'The placement is no longer needed' },
    ...convertKeyValuePairToRadioItems(placementNoLongerNeededOptions, selectedReason),
    { divider: 'The placement is unavailable' },
    ...convertKeyValuePairToRadioItems(noCapacityOptions, selectedReason),
    { divider: 'Problem in placement' },
    ...convertKeyValuePairToRadioItems(problemInPlacementOptions, selectedReason),
  ]
}
