import { Section } from '../../utils/decorators'
import MatchingInformationTask from './matchingInformationTask'

@Section({
  title: 'Information for matching',
  tasks: [MatchingInformationTask],
})
export default class MatchingInformation {}
