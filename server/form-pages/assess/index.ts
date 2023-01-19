import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'
import ReviewApplication from './reviewApplication'
import AssessApplication from './assessApplication'
import MakeADecision from './makeADecision'

@Form({ sections: [ReviewApplication, AssessApplication, MakeADecision] })
export default class Assess extends BaseForm {}
