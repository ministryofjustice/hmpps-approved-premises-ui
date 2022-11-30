/* istanbul ignore file */

import { Form } from '@approved-premises/ui'
import { CheckYourAnswers } from './check-your-answers'
import { MoveOn } from './move-on'
import ReasonsForPlacement from './reasons-for-placement'
import RiskAndNeedFactors from './risk-and-need-factors'

import { getSection, getPagesForSections } from '../utils'

const sectionClasses = [ReasonsForPlacement, RiskAndNeedFactors, MoveOn, CheckYourAnswers]

const Apply = {
  pages: getPagesForSections([ReasonsForPlacement, RiskAndNeedFactors, MoveOn, CheckYourAnswers]),
  sections: sectionClasses.map(s => getSection(s)),
} as Form

export default Apply
