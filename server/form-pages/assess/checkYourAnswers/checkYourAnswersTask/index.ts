import { Task } from '../../../utils/decorators'
import CheckYourAnswersPage from './checkYourAnswers'

@Task({
  slug: 'check-your-answers',
  name: 'Check assessment answers',
  pages: [CheckYourAnswersPage],
})
export default class CheckYourAnswersTask {}
