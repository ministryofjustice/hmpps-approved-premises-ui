/* istanbul ignore file */
import { Task } from '../../utils/decorators'

import RelocationRegion from './relocationRegion'
import PlacementDuration from './placementDuration'
import PlansInPlace from './plansInPlace'
import TypeOfAccommodation from './typeOfAccommodation'
import ForeignNational from './foreignNational'

const pages = {
  'placement-duration': PlacementDuration,
  'relocation-region': RelocationRegion,
  'plans-in-place': PlansInPlace,
  'type-of-accommodation': TypeOfAccommodation,
  'foreign-national': ForeignNational,
}

export default pages

@Task({
  slug: 'move-on',
  name: 'Add move on information',
  pages: [PlacementDuration, RelocationRegion, PlansInPlace, TypeOfAccommodation, ForeignNational],
})
export class MoveOn {}
