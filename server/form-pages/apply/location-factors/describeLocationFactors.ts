import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'

const radiuses = ['60', '70', '80', '90', '100', '110', '120', '130', '140', '150'] as const

type Radiuses = typeof radiuses[number]

export default class DescribeLocationFactors implements TasklistPage {
  name = 'describe-location-factors'

  title = 'Location factors'

  body: {
    postcodeArea: string
    positiveFactors: string
    restrictions: YesOrNo
    restrictionDetail: string
    alternativeRadiusAccepted: YesOrNo
    alternativeRadius: typeof radiuses[number]
    differentPDU: YesOrNo
  }

  questions = {
    postcodeArea: 'What is the preferred location for the AP placement?',
    positiveFactors: 'Give details of any positive factors for the person in this location.',
    restrictions: 'Are there any restrictions linked to placement location?',
    restrictionDetail:
      'Provide details of any restraining orders, exclusion zones, inclusion zones or other location based licence conditions.',
    alternativeRadiusAccepted:
      'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?',
    alternativeRadius: 'Choose the maximum radius (in miles)',
    differentPDU: `Is the person moving to a different area where they'll be managed by a different probation delivery unit (PDU)?`,
  }

  constructor(body: Record<string, unknown>) {
    this.body = {
      postcodeArea: body.postcodeArea as string,
      positiveFactors: body.positiveFactors as string,
      restrictions: body.restrictions as YesOrNo,
      restrictionDetail: body.restrictionDetail as string,
      alternativeRadiusAccepted: body.alternativeRadiusAccepted as YesOrNo,
      alternativeRadius: body.alternativeRadius as Radiuses,
      differentPDU: body.differentPDU as YesOrNo,
    }
  }

  previous() {
    return ''
  }

  next() {
    if (this.body.differentPDU) {
      return 'pdu-transfer'
    }
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.postcodeArea) {
      errors.postcodeArea = 'You must specify a preferred postcode area for the placement'
    } else if (
      !this.body.postcodeArea.match(/[A-Z][0-9]{1,2}|[A-Z][A-HJ-Y][0-9]{1,2}|[A-Z][0-9][A-Z]|[A-Z][A-HJ-Y][0-9]?[A-Z]/)
    ) {
      errors.postcodeArea = 'The preferred postcode area must be a valid postcode area (i.e SW1A)'
    }

    if (!this.body.restrictions) {
      errors.restrictions = 'You must specify if there are any restrictions linked to placement location'
    }

    if (this.body.restrictions === 'yes' && !this.body.restrictionDetail) {
      errors.restrictionDetail = 'You must provide details of any restrictions  linked to placement location'
    }

    if (!this.body.alternativeRadiusAccepted) {
      errors.alternativeRadiusAccepted =
        'You must specify if a placement in an alternative locality would be considered'
    }

    if (this.body.alternativeRadiusAccepted === 'yes' && !this.body.alternativeRadius) {
      errors.alternativeRadius = 'You must choose an alternative radius'
    }

    if (!this.body.differentPDU) {
      errors.differentPDU = `You must specify if the person is moving to a different area where they'll be managed by a different probation delivery unit`
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
      [this.questions.differentPDU]: sentenceCase(this.body.differentPDU),
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
