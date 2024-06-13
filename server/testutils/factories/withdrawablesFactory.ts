import { Factory } from 'fishery'
import { Withdrawables } from '../../@types/shared'
import { withdrawableFactory } from './index'

export default Factory.define<Withdrawables>(() => ({
  notes: [
    '1 or more placements cannot be withdrawn as they have an arrival',
    '1 or more placements cannot be withdrawn as they have an arrival recorded in Delius',
  ],
  withdrawables: withdrawableFactory.buildList(1, { type: 'application' }),
}))
