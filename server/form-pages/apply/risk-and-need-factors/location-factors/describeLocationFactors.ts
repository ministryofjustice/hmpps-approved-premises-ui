import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { validPostcodeArea } from '../../../../utils/formUtils'
import { sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'

const radiuses = ['60', '70', '80', '90', '100', '110', '120', '130', '140', '150'] as const

type DescribeLocationFactorsBody = {
  postcodeArea: string
  positiveFactors: string
  restrictions: YesOrNo
  restrictionDetail: string
  alternativeRadiusAccepted: YesOrNo
  alternativeRadius?: (typeof radiuses)[number]
}

@Page({
  name: 'describe-location-factors',
  bodyProperties: [
    'postcodeArea',
    'positiveFactors',
    'restrictions',
    'restrictionDetail',
    'alternativeRadiusAccepted',
    'alternativeRadius',
  ],
})
export default class DescribeLocationFactors implements TasklistPage {
  title = 'Location factors'

  questions = {
    postcodeArea: 'What is the preferred postcode area for the Approved Premises (AP) placement?',
    positiveFactors: 'Give details of why this postcode area would benefit the person',
    restrictions: 'Are there any restrictions linked to placement location?',
    restrictionDetail:
      'Provide details of any restraining orders, exclusion zones or other location based licence conditions. You must also provide an exclusion zone map in the ‘attach required documents’ screen.',
    alternativeRadiusAccepted:
      'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?',
    alternativeRadius: 'Choose the maximum radius (in miles)',
  }

  body: DescribeLocationFactorsBody

  constructor(body: Partial<DescribeLocationFactorsBody>) {
    if (body.alternativeRadiusAccepted === 'yes') {
      this.body = body as DescribeLocationFactorsBody
    } else {
      delete body.alternativeRadius
      this.body = body as DescribeLocationFactorsBody
    }
    this.body.postcodeArea = body?.postcodeArea?.toUpperCase().trim()
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'preferred-aps'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.postcodeArea) {
      errors.postcodeArea = 'You must specify a preferred postcode area for the placement'
    } else if (!validPostcodeArea(this.body.postcodeArea)) {
      errors.postcodeArea = 'The preferred postcode area must be a valid postcode area (i.e SW1A)'
    }

    if (!this.body.restrictions) {
      errors.restrictions = 'You must specify if there are any restrictions linked to placement location'
    }

    if (this.body.restrictions === 'yes' && !this.body.restrictionDetail) {
      errors.restrictionDetail = 'You must provide details of any restrictions linked to placement location'
    }

    if (!this.body.alternativeRadiusAccepted) {
      errors.alternativeRadiusAccepted =
        'You must specify if a placement in an alternative locality would be considered'
    }

    if (this.body.alternativeRadiusAccepted === 'yes' && !this.body.alternativeRadius) {
      errors.alternativeRadius = 'You must choose an alternative radius'
    }

    return errors
  }

  response() {
    const response = {
      [this.questions.postcodeArea]: this.body.postcodeArea,
      [this.questions.positiveFactors]: this.body.positiveFactors,
      [this.questions.restrictions]: sentenceCase(this.body.restrictions),
      [this.questions.restrictionDetail]: this.body.restrictionDetail,
      [this.questions.alternativeRadiusAccepted]: sentenceCase(this.body.alternativeRadiusAccepted),
      [this.questions.alternativeRadius]: this.body.alternativeRadius ? `${this.body.alternativeRadius} miles` : '',
    }

    Object.keys(response).forEach(key => {
      if (!response[key]) {
        delete response[key]
      }
    })

    return response
  }

  radiusItems() {
    return radiuses.map(item => {
      return { key: `${item} miles`, value: item }
    })
  }
}
