import { Section } from '../../utils/decorators'
import ReviewApplication from './reviewApplicationAndDocumentsTask'

@Section({
  name: 'Review application',
  tasks: [ReviewApplication],
})
export default class ReviewApplicationSection {}
