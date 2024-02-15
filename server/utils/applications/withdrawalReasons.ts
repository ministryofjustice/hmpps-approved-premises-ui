import { WithdrawalReason } from '../../@types/shared'
import { convertKeyValuePairToRadioItems } from '../formUtils'
import { filterByType } from '../utils'

const newApplicationToBeSubmittedReasons = ['change_in_circumstances_new_application_to_be_submitted'] as const
const applicationProblemReasons = ['error_in_application', 'duplicate_application'] as const
const placementNoLongerNeededReasons = ['death', 'other_accommodation_identified', 'other'] as const

export type NewApplicationToBeSubmittedReasons = Extract<
  WithdrawalReason,
  (typeof newApplicationToBeSubmittedReasons)[number]
>
export type ApplicationProblemReasons = Extract<WithdrawalReason, (typeof applicationProblemReasons)[number]>
export type OtherReasons = Extract<WithdrawalReason, (typeof placementNoLongerNeededReasons)[number]>

export const withdrawalReasons: Record<WithdrawalReason, string> = {
  death: 'The person died',
  other_accommodation_identified: 'Other accommodation has been identified',
  other: 'The placement is not needed for another reason',
  change_in_circumstances_new_application_to_be_submitted: 'Their circumstances changed',
  error_in_application: 'There was an error in the application',
  duplicate_application: 'The application was a duplicate',
}

export const newApplicationToBeSubmittedOptions = filterByType<NewApplicationToBeSubmittedReasons>(
  newApplicationToBeSubmittedReasons,
  withdrawalReasons,
)
export const applicationProblemOptions = filterByType<ApplicationProblemReasons>(
  applicationProblemReasons,
  withdrawalReasons,
)
export const placementNoLongerNeededOptions = filterByType<OtherReasons>(
  placementNoLongerNeededReasons,
  withdrawalReasons,
)

export const withdrawalRadioOptions = [
  { divider: 'The application is no longer needed' },
  ...convertKeyValuePairToRadioItems(placementNoLongerNeededOptions, undefined),
  { divider: 'A new placement is needed' },
  ...convertKeyValuePairToRadioItems(newApplicationToBeSubmittedOptions, undefined),
  { divider: "There's a problem with the application" },
  ...convertKeyValuePairToRadioItems(applicationProblemOptions, undefined),
]
