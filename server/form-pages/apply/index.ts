/* istanbul ignore file */

import type { TaskNames, FormSections } from '@approved-premises/ui'
import basicInfomationPages from './basic-information'
import typeOfApPages from './type-of-ap'
import riskAndNeedPages from './risk-management-features'
import locationFactorPages from './location-factors'
import accessAndHealthcarePages from './access-and-healthcare'
import furtherConsiderationsPages from './further-considerations'

const pages: {
  [key in TaskNames]: Record<string, unknown>
} = {
  'basic-information': basicInfomationPages,
  'type-of-ap': typeOfApPages,
  'risk-management-features': riskAndNeedPages,
  'location-factors': locationFactorPages,
  'access-and-healthcare': accessAndHealthcarePages,
  'further-considerations': furtherConsiderationsPages,
}

const sections: FormSections = [
  {
    title: 'Reasons for placement',
    tasks: [
      {
        id: 'basic-information',
        title: 'Basic Information',
        pages: basicInfomationPages,
      },
      {
        id: 'type-of-ap',
        title: 'Type of AP required',
        pages: typeOfApPages,
      },
    ],
  },
  {
    title: 'Risk and need factors',
    tasks: [
      {
        id: 'risk-management-features',
        title: 'Add detail about managing risks and needs',
        pages: riskAndNeedPages,
      },
      {
        id: 'location-factors',
        title: 'Describe location factors',
        pages: locationFactorPages,
      },
      {
        id: 'access-and-healthcare',
        title: 'Provide access and healthcare information',
        pages: accessAndHealthcarePages,
      },
      {
        id: 'further-considerations',
        title: 'Detail further considerations for placement',
        pages: furtherConsiderationsPages,
      },
    ],
  },
]

export { pages, sections }
