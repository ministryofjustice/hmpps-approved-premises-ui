import { Section } from '../../utils/decorators'
import MakeADecisionTask from './makeADecisionTask'

@Section({
  title: 'Make a decision',
  tasks: [MakeADecisionTask],
})
export default class MakeADecision {}
