import { Person } from '../@types/shared'
import { TableCell } from '../@types/ui'

export const nameCell = (item: { person?: Person }): TableCell => ({ text: item?.person?.name || '' })
