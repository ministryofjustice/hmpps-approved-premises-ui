/* istanbul ignore file */

import Review from './review'
import { Task } from '../../utils/decorators'

const pages = {
  review: Review,
}

export default pages

@Task({
  name: 'Check your answers',
  slug: 'check-your-answers',
  pages: [Review],
})
export class CheckYourAnswers {}
