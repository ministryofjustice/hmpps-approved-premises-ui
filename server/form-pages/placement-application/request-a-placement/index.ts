/* istanbul ignore file */

import { Section, Task } from '../../utils/decorators'
import ReasonsForPlacement from './reasonForPlacement'
import PreviousRotlPlacement from './previous-rotl-placement'
import { Section, Task } from '../../utils/decorators'

@Task({
  name: 'Request a placement',
  slug: 'request-a-placement',
  pages: [ReasonsForPlacement],
})
@Section({
  title: 'Request a Placement',
  tasks: [RequestAPlacement],
})
export default class RequestAPlacement {}
