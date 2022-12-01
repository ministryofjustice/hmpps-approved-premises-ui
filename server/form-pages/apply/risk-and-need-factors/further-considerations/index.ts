/* istanbul ignore file */

import RoomSharing from './roomSharing'
import Vulnerability from './vulnerability'
import PreviousPlacements from './previousPlacements'
import ComplexCaseBoard from './complexCaseBoard'
import Catering from './catering'
import Arson from './arson'
import { Task } from '../../../utils/decorators'

@Task({
  name: 'Detail further considerations for placement',
  slug: 'further-considerations',
  pages: [RoomSharing, Vulnerability, PreviousPlacements, ComplexCaseBoard, Catering, Arson],
})
export default class FurtherConsiderations {}
