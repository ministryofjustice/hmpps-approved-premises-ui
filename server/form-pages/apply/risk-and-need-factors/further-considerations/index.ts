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
import Rfap from './rfap'

import { Task } from '../../../utils/decorators'
import RfapDetails from './rfapDetails'

@Task({
  name: 'Detail further considerations for placement',
  slug: 'further-considerations',
  pages: [
    RoomSharing,
    Vulnerability,
    PreviousPlacements,
    Rfap,
    RfapDetails,
    Catering,
    Arson,
    AdditionalCircumstances,
    ContingencyPlanPartners,
    ContingencyPlanQuestions,
    TriggerPlan,
  ],
})
export default class FurtherConsiderations {}
