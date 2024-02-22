import { Withdrawable } from '../../../@types/shared'
import { DateFormats } from '../../dateUtils'

export const sortAndFilterWithdrawables = (
  withdrawables: Array<Withdrawable>,
  typesToInclude: Array<Withdrawable['type']>,
) => {
  return withdrawables
    .filter(withdrawable => typesToInclude.includes(withdrawable.type))
    .sort((a, b) => {
      if (!a.dates.length || !b.dates.length) {
        throw Error(`Withdrawable does not have dates. a: ${a.id}, b: ${b.id}`)
      }

      try {
        return (
          DateFormats.isoToDateObj(a.dates[0].startDate).getTime() -
          DateFormats.isoToDateObj(b.dates[0].startDate).getTime()
        )
      } catch (e) {
        throw new Error(`Error sorting withdrawables: ${e.message}`)
      }
    })
}
