import { Section } from '../../utils/decorators'
import CheckYourAnswersTask from './checkYourAnswersTask'

@Section({
  title: 'Check your answers',
  tasks: [CheckYourAnswersTask],
})
export default class CheckYourAnswers {}
