import { CheckBoxItem } from '../../@types/ui'
import { RelevantDatesT } from '../../form-pages/apply/reasons-for-placement/basic-information/relevantDates'

export const relevantDatesOptions = (
  relevantDates: RelevantDatesT,
  conditionals: Array<string>,
  selectedDates: Array<string> = [],
): Array<CheckBoxItem> => {
  return Object.entries(relevantDates).map(([key, label], i) => {
    return {
      text: label,
      value: key,
      checked: selectedDates.includes(key),
      conditional: { html: conditionals[i] },
    }
  })
}
