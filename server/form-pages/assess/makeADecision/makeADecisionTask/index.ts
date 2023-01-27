import { Task } from '../../../utils/decorators'

import MakeADecisionPage from './makeADecision'

@Task({
  slug: 'make-a-decision',
  name: 'Make a decision',
  pages: [MakeADecisionPage],
})
export default class MakeADecision {}
