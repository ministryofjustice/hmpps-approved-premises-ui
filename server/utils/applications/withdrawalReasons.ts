import { WithdrawalReason } from '../../@types/shared'
import { convertKeyValuePairToRadioItems } from '../formUtils'

const placementNoLongerRequiredReasons = [
  'alternative_identified_placement_no_longer_required',
  'change_in_circumstances_placement_no_longer_required',
  'change_in_release_date_placement_no_longer_required',
  'change_in_release_decision_placement_no_longer_required',
] as const
const newApplicationToBeSubmittedReasons = ['change_in_circumstances_new_application_to_be_submitted'] as const
const applicationProblemReasons = ['error_in_application', 'duplicate_application'] as const
const otherReasons = ['other'] as const

export type PlacementNoLongerRequiredReasons = Extract<
  WithdrawalReason,
  (typeof placementNoLongerRequiredReasons)[number]
>
export type NewApplicationToBeSubmittedReasons = Extract<
  WithdrawalReason,
  (typeof newApplicationToBeSubmittedReasons)[number]
>
export type ApplicationProblemReasons = Extract<WithdrawalReason, (typeof applicationProblemReasons)[number]>
export type OtherReasons = Extract<WithdrawalReason, (typeof otherReasons)[number]>

export const withdrawlReasons: Record<WithdrawalReason, string> = {
  alternative_identified_placement_no_longer_required: 'Alternative provision identified',
  change_in_circumstances_placement_no_longer_required: 'Change in circumstances',
  change_in_circumstances_new_application_to_be_submitted: 'Change in circumstances',
  change_in_release_date_placement_no_longer_required: 'Release date changed',
  change_in_release_decision_placement_no_longer_required: 'Change in release decision',
  error_in_application: 'Error in application',
  duplicate_application: 'Duplicate application',
  other: 'Other',
}

const filterByType = <T extends WithdrawalReason>(keys: Readonly<Array<string>>): Record<T, string> => {
  return Object.keys(withdrawlReasons)
    .filter(k => keys.includes(k))
    .reduce((criteria, key) => ({ ...criteria, [key]: withdrawlReasons[key] }), {}) as Record<T, string>
}

export const placementNoLongerRequiredOptions = filterByType<PlacementNoLongerRequiredReasons>(
  placementNoLongerRequiredReasons,
)
export const newApplicationToBeSubmittedOptions = filterByType<NewApplicationToBeSubmittedReasons>(
  newApplicationToBeSubmittedReasons,
)
export const applicationProblemOptions = filterByType<ApplicationProblemReasons>(applicationProblemReasons)
export const otherOptions = filterByType<OtherReasons>(otherReasons)

export const withdrawalRadioOptions = (conditionalValue: string) => [
  { divider: 'Placement no longer required' },
  ...convertKeyValuePairToRadioItems(placementNoLongerRequiredOptions, undefined),
  { divider: 'New application required' },
  ...convertKeyValuePairToRadioItems(newApplicationToBeSubmittedOptions, undefined),
  { divider: 'Problems with submitted application' },
  ...convertKeyValuePairToRadioItems(applicationProblemOptions, undefined),
  { divider: 'Or' },
  {
    text: 'Other',
    value: 'other',
    conditional: {
      html: conditionalValue,
    },
  },
]
