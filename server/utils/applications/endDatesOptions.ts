import { CheckBoxItem } from '../../@types/ui'
import { RelevantDates } from '../../form-pages/apply/reasons-for-placement/basic-information/endDates'

export const endDatesOptions = (relevantDates: RelevantDates, conditionals: Array<string>): Array<CheckBoxItem> => {
  return Object.entries(relevantDates).map(([key, label], i) => {
    return {
      text: label,
      value: key,
      conditional: { html: conditionals[i] },
    }
  })
}
