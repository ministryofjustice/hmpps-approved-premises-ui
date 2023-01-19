import { Task } from '../../../utils/decorators'
import MatchingInformationPage from './matchingInformation'

@Task({
  name: 'Matching information',
  slug: 'matching-information',
  pages: [MatchingInformationPage],
})
export default class MatchingInformation {}
