/* istanbul ignore file */
import CheckYourAnswers from './check-your-answers'
import MoveOn from './move-on'
import ReasonsForPlacement from './reasons-for-placement'
import RiskAndNeedFactors from './risk-and-need-factors'
import AddDocuments from './add-documents'

import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'

@Form({ sections: [ReasonsForPlacement, RiskAndNeedFactors, MoveOn, AddDocuments, CheckYourAnswers] })
export default class Apply extends BaseForm {}
