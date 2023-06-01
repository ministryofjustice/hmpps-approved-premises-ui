/* istanbul ignore file */

import AdditionalCircumstances from './additionalCircumstances'
import RoomSharing from './roomSharing'
import Vulnerability from './vulnerability'
import PreviousPlacements from './previousPlacements'
import Catering from './catering'
import Arson from './arson'
import ContingencyPlanPartners from './contingencyPlanPartners'
import ContingencyPlanQuestions from './contingencyPlanQuestions'
import TriggerPlan from './triggerPlan'

import { Task } from '../../../utils/decorators'

@Task({
  name: 'Detail further considerations for placement',
  slug: 'further-considerations',
  pages: [
    RoomSharing,
    Vulnerability,
    PreviousPlacements,
    Catering,
    Arson,
    AdditionalCircumstances,
    ContingencyPlanPartners,
    ContingencyPlanQuestions,
    TriggerPlan,
  ],
})
export default class FurtherConsiderations {}
