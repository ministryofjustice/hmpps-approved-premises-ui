/* istanbul ignore file */

import type { TaskNames, FormSections } from '@approved-premises/ui'

import basicInfomationPages, { BasicInformation } from './basic-information'
import typeOfApPages, { TypeOfAp } from './type-of-ap'
import riskAndNeedPages, { RiskManagement } from './risk-management-features'
import prisonInformationPages, { PrisonInformation } from './prison-information'
import locationFactorPages, { LocationFactors } from './location-factors'
import accessAndHealthcarePages, { AccessAndHealthcare } from './access-and-healthcare'
import furtherConsiderationsPages, { FurtherConsiderations } from './further-considerations'
import moveOnPages, { MoveOn } from './move-on'
import checkYourAnswersPages, { CheckYourAnswers } from './check-your-answers'

import { getTask } from '../utils'

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
  {
    title: 'Reasons for placement',
    tasks: [getTask(BasicInformation), getTask(TypeOfAp)],
  },
  {
    title: 'Risk and need factors',
    tasks: [
      getTask(RiskManagement),
      getTask(PrisonInformation),
      getTask(LocationFactors),
      getTask(AccessAndHealthcare),
      getTask(FurtherConsiderations),
    ],
  },
  {
    title: 'Considerations for when the placement ends',
    tasks: [getTask(MoveOn)],
  },
  {
    title: 'Check your answers',
    tasks: [getTask(CheckYourAnswers)],
  },
]

export { pages, sections }
