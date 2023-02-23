/* istanbul ignore file */

import RoomSharing from './roomSharing'
import Vulnerability from './vulnerability'
import PreviousPlacements from './previousPlacements'
import ComplexCaseBoard from './complexCaseBoard'
import Catering from './catering'
import Arson from './arson'
import ContingencyPlanPartners from './contingencyPlanPartners'
import ContingencyPlanQuestions from './contingencyPlanQuestions'

import { Task } from '../../../utils/decorators'

@Task({
  name: 'Detail further considerations for placement',
  slug: 'further-considerations',
  pages: [
    RoomSharing,
    Vulnerability,
    PreviousPlacements,
    ComplexCaseBoard,
    Catering,
    Arson,
    ContingencyPlanPartners,
    ContingencyPlanQuestions,
  ],
})
export default class FurtherConsiderations {}
