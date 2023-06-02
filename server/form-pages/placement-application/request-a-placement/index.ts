/* istanbul ignore file */

import ReasonsForPlacement from './reason-for-placement'
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
