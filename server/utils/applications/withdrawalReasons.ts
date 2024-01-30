import { WithdrawalReason } from '../../@types/shared'
import { convertKeyValuePairToRadioItems } from '../formUtils'

const newApplicationToBeSubmittedReason = 'change_in_circumstances_new_application_to_be_submitted' as const
const applicationProblemReasons = ['error_in_application', 'duplicate_application'] as const
const otherReasons = ['other'] as const

export type ApplicationProblemReasons = Extract<WithdrawalReason, (typeof applicationProblemReasons)[number]>
export type OtherReasons = Extract<WithdrawalReason, (typeof otherReasons)[number]>

export const withdrawlReasons = {
  change_in_circumstances_new_application_to_be_submitted: 'Change in circumstances',
  error_in_application: 'Error in application',
  duplicate_application: 'Duplicate application',
  other: 'Other',
}

const filterByType = <T extends WithdrawalReason>(keys: Readonly<Array<string>>): Record<T, string> => {
  return Object.keys(withdrawlReasons)
    .filter(k => keys.includes(k))
    .reduce((criteria, key) => ({ ...criteria, [key]: withdrawlReasons[key] }), {}) as Record<T, string>
}

export const newApplicationToBeSubmittedOptions = filterByType<typeof newApplicationToBeSubmittedReason>([
  newApplicationToBeSubmittedReason,
])
export const applicationProblemOptions = filterByType<ApplicationProblemReasons>(applicationProblemReasons)
export const otherOptions = filterByType<OtherReasons>(otherReasons)

export const withdrawalRadioOptions = (conditionalValue: string) => [
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
