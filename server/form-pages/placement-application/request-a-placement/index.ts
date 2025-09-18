/* istanbul ignore file */

import { Section, Task } from '../../utils/decorators'
import SentenceTypeCheck from './sentenceTypeCheck'
import SentenceType from './sentenceType'
import ReleaseType from './releaseType'
import Situation from './situation'
import ManagedByMappa from './managedByMappa'
import PreviousRotlPlacement from './previousRotlPlacement'
import SameAp from './sameAp'
import DatesOfPlacement from './datesOfPlacement'
import UpdatesToApplication from './updatesToApplication'
import CheckYourAnswers from './checkYourAnswers'
import AdditionalPlacementDetails from './additionalPlacementDetails'
import DecisionToRelease from './decisionToRelease'
import AdditionalDocuments from './additionalDocuments'

@Task({
  name: 'Request a placement',
  slug: 'request-a-placement',
  pages: [
    SentenceTypeCheck,
    SentenceType,
    ReleaseType,
    Situation,
    ManagedByMappa,
    PreviousRotlPlacement,
    AdditionalPlacementDetails,
    SameAp,
    DatesOfPlacement,
    UpdatesToApplication,
    CheckYourAnswers,
    DecisionToRelease,
    AdditionalDocuments,
  ],
})
@Section({
  title: 'Request a Placement',
  tasks: [RequestAPlacement],
})
export default class RequestAPlacement {}
