/* istanbul ignore file */

import type { TaskNames, FormSections } from '@approved-premises/ui'

import basicInfomationPages from './reasons-for-placement/basic-information'
import typeOfApPages from './reasons-for-placement/type-of-ap'
import riskAndNeedPages from './risk-and-need-factors/risk-management-features'
import prisonInformationPages from './risk-and-need-factors/prison-information'
import locationFactorPages from './risk-and-need-factors/location-factors'
import accessAndHealthcarePages from './risk-and-need-factors/access-and-healthcare'
import furtherConsiderationsPages from './risk-and-need-factors/further-considerations'

import checkYourAnswersPages, { CheckYourAnswers } from './check-your-answers'
import moveOnPages, { MoveOn } from './move-on'
import ReasonsForPlacement from './reasons-for-placement'
import RiskAndNeedFactors from './risk-and-need-factors'

import { getSection } from '../utils'

const pages: {
  [key in TaskNames]: Record<string, unknown>
} = {
  'basic-information': basicInfomationPages,
  'type-of-ap': typeOfApPages,
  'risk-management-features': riskAndNeedPages,
  'prison-information': prisonInformationPages,
  'location-factors': locationFactorPages,
  'access-and-healthcare': accessAndHealthcarePages,
  'further-considerations': furtherConsiderationsPages,
  'move-on': moveOnPages,
  'check-your-answers': checkYourAnswersPages,
}

const sections: FormSections = [
  getSection(ReasonsForPlacement),
  getSection(RiskAndNeedFactors),
  getSection(MoveOn),
  getSection(CheckYourAnswers),
]

export { pages, sections }
