/* istanbul ignore file */

import RoomSharing from './roomSharing'
import Vulnerability from './vulnerability'
import PreviousPlacements from './previousPlacements'
import ComplexCaseBoard from './complexCaseBoard'
import Catering from './catering'
import Arson from './arson'

const pages = {
  'room-sharing': RoomSharing,
  vulnerability: Vulnerability,
  'previous-placements': PreviousPlacements,
  'complex-case-board': ComplexCaseBoard,
  catering: Catering,
  arson: Arson,
}

export default pages
