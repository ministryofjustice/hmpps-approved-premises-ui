import { Section } from '../../utils/decorators'
import MakeADecisionTask from './makeADecisionPage'

@Section({
  name: 'Make a decision',
  tasks: [MakeADecisionTask],
})
export default class MakeADecision {}
