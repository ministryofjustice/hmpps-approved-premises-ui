/* istanbul ignore file */

import { Section, Task } from '../../utils/decorators'
import ReasonsForPlacement from './reasonForPlacement'
import PreviousRotlPlacement from './previousRotlPlacement'
import SameAp from './sameAp'
import DatesOfPlacement from './datesOfPlacement'
import UpdatesToApplication from './updatesToApplication'
import CheckYourAnswers from './checkYourAnswers'

@Task({
  name: 'Request a placement',
  slug: 'request-a-placement',
  pages: [ReasonsForPlacement, PreviousRotlPlacement],
})
@Section({
  title: 'Request a Placement',
  tasks: [RequestAPlacement],
})
export default class RequestAPlacement {}
