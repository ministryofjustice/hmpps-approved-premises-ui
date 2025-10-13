import type { RadioItemButton } from '@approved-premises/ui'
import { convertObjectsToRadioItems } from './formUtils'

export const cancellationReasonsRadioItems = (
  cancellationReasons: Array<Record<string, string>>,
  otherHtml: string,
  context: Record<string, unknown>,
): Array<RadioItemButton> => {
  const items = convertObjectsToRadioItems(cancellationReasons, 'name', 'id', 'cancellation[reason]', context)

  return items.map(item => {
    if (item.text === 'Other') {
      item.conditional = {
        html: otherHtml,
      }
    }

    return item
  })
}
