/* istanbul ignore file */

import Review from './review'
import { Task, Section } from '../../utils/decorators'

const pages = {
  review: Review,
}

export default pages

@Task({
  name: 'Check your answers',
  slug: 'check-your-answers',
  pages: [Review],
})
@Section({
  name: 'Check your answers',
  tasks: [CheckYourAnswers],
})
export class CheckYourAnswers {}
