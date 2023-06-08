/* istanbul ignore file */

import { Section, Task } from '../../utils/decorators'
import ReasonsForPlacement from './reasonForPlacement'
import PreviousRotlPlacement from './previousRotlPlacement'
import SameAp from './sameAp'
import DatesOfPlacement from './datesOfPlacement'
import UpdatesToApplication from './updatesToApplication'
import CheckYourAnswers from './checkYourAnswers'
import AdditionalPlacementDetails from './additionalPlacementDetails'
import DecisionToRelease from './decisionToRelease'

@Task({
  name: 'Request a placement',
  slug: 'request-a-placement',
  pages: [
    ReasonsForPlacement,
    PreviousRotlPlacement,
    AdditionalPlacementDetails,
    SameAp,
    DatesOfPlacement,
    UpdatesToApplication,
    CheckYourAnswers,
    DecisionToRelease,
  ],
})
@Section({
  title: 'Request a Placement',
  tasks: [RequestAPlacement],
})
export default class RequestAPlacement {}
