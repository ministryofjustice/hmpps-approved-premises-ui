import { Section } from '../../utils/decorators'
import MakeADecisionTask from './makeADecisionPage'

@Section({
  title: 'Make a decision',
  tasks: [MakeADecisionTask],
})
export default class MakeADecision {}
