/* istanbul ignore file */
import { Section, Task } from '../../utils/decorators'

import RelocationRegion from './relocationRegion'
import PlacementDuration from './placementDuration'
import PlansInPlace from './plansInPlace'
import TypeOfAccommodation from './typeOfAccommodation'
import ForeignNational from './foreignNational'

@Task({
  slug: 'move-on',
  name: 'Add move on information',
  pages: [PlacementDuration, RelocationRegion, PlansInPlace, TypeOfAccommodation, ForeignNational],
})
@Section({
  title: 'Considerations for when the placement ends',
  tasks: [MoveOn],
})
export default class MoveOn {}
