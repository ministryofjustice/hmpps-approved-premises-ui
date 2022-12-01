/* istanbul ignore file */

import SentenceType from './sentenceType'
import ReleaseType from './releaseType'
import Situation from './situation'
import ReleaseDate from './releaseDate'
import OralHearing from './oralHearing'
import PlacementDate from './placementDate'
import PlacementPurpose from './placementPurpose'
import { Task } from '../../../utils/decorators'

const pages = {
  'sentence-type': SentenceType,
  'release-type': ReleaseType,
  situation: Situation,
  'release-date': ReleaseDate,
  'oral-hearing': OralHearing,
  'placement-date': PlacementDate,
  'placement-purpose': PlacementPurpose,
}

export default pages

@Task({
  name: 'Basic Information',
  slug: 'basic-information',
  pages: [SentenceType, ReleaseType, Situation, ReleaseDate, OralHearing, PlacementDate, PlacementPurpose],
})
export class BasicInformation {}
