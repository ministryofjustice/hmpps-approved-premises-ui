import { WithdrawPlacementRequestReason } from '@approved-premises/api'
import { RadioItem, UserDetails } from '../../../@types/ui'
import { convertKeyValuePairToRadioItems } from '../../formUtils'
import { filterByType } from '../../utils'
import { hasPermission } from '../../users'

type UserFacingWithdrawalReasons = Exclude<
  WithdrawPlacementRequestReason,
  | 'RelatedPlacementApplicationWithdrawn'
  | 'RelatedPlacementRequestWithdrawn'
  | 'RelatedApplicationWithdrawn'
  | 'WithdrawnByPP'
>

const withdrawalReasons: Record<UserFacingWithdrawalReasons, string> = {
  AlternativeProvisionIdentified: 'Another provision has been identified',
  ChangeInCircumstances: 'Their circumstances changed',
  ChangeInReleaseDecision: 'The release decision changed',
  NoCapacityDueToLostBed: "There's no capacity due to a lost bed",
  NoCapacityDueToPlacementPrioritisation: "There's no capacity due to placement prioritisation",
  NoCapacity: "There's no capacity",
  ErrorInPlacementRequest: 'There was an error in the request',
  DuplicatePlacementRequest: 'The request was a duplicate',
}

export const placementNoLongerNeededReasons = [
  'AlternativeProvisionIdentified',
  'ChangeInCircumstances',
  'ChangeInReleaseDecision',
] as const
export const noCapacityReasons = [
  'NoCapacityDueToLostBed',
  'NoCapacityDueToPlacementPrioritisation',
  'NoCapacity',
] as const
export const problemInPlacementReasons = ['ErrorInPlacementRequest', 'DuplicatePlacementRequest'] as const

type PlacementNoLongerNeededReasons = Extract<
  WithdrawPlacementRequestReason,
  (typeof placementNoLongerNeededReasons)[number]
>
type NoCapacityReasons = Extract<WithdrawPlacementRequestReason, (typeof noCapacityReasons)[number]>
type ProblemInPlacementReasons = Extract<WithdrawPlacementRequestReason, (typeof problemInPlacementReasons)[number]>

const placementNoLongerNeededOptions = filterByType<PlacementNoLongerNeededReasons>(
  placementNoLongerNeededReasons,
  withdrawalReasons,
)
const noCapacityOptions = filterByType<NoCapacityReasons>(noCapacityReasons, withdrawalReasons)
const problemInPlacementOptions = filterByType<ProblemInPlacementReasons>(problemInPlacementReasons, withdrawalReasons)

const placementNoLongerNeededDividerAndRadioItems = [
  { divider: 'The placement is no longer needed' },
  ...convertKeyValuePairToRadioItems(placementNoLongerNeededOptions),
]
const noCapacityDividerAndRadioItems = [
  { divider: 'The placement is unavailable (CRU use only)' },
  ...convertKeyValuePairToRadioItems(noCapacityOptions),
]
const problemInPlacementDividerAndRadioItems = [
  { divider: 'Problem in placement' },
  ...convertKeyValuePairToRadioItems(problemInPlacementOptions),
]

export const placementApplicationWithdrawalReasons = (user: UserDetails): Array<RadioItem | { divider: string }> => {
  return hasPermission(user, ['cas1_view_cru_dashboard'])
    ? [
        placementNoLongerNeededDividerAndRadioItems,
        noCapacityDividerAndRadioItems,
        problemInPlacementDividerAndRadioItems,
      ].flat()
    : [placementNoLongerNeededDividerAndRadioItems, problemInPlacementDividerAndRadioItems].flat()
}
