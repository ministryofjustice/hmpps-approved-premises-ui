import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'
import ReviewApplication from './reviewApplication'
import AssessApplication from './assessApplication'
import MakeADecision from './makeADecision'
import MatchingInformation from './matchingInformation'

@Form({ sections: [ReviewApplication, AssessApplication, MakeADecision, MatchingInformation] })
export default class Assess extends BaseForm {}
