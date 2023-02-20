import type { PartnerAgencyDetails, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { lowerCase, sentenceCase } from '../../../../utils/utils'

const fields: PartnerAgencyDetails = {
  partnerAgencyName: 'Name of partner agency',
  namedContact: 'Named contact',
  phoneNumber: 'Contact details (phone)',
  roleInPlan: 'Role in contingency plan',
} as const

export type Body = PartnerAgencyDetails & {
  partnerAgencyDetails: Array<PartnerAgencyDetails>
}

@Page({
  name: 'contingency-plan-partners',
  bodyProperties: ['partnerAgencyDetails', 'namedContact', 'phoneNumber', 'roleInPlan', 'partnerAgencyName'],
})
export default class ContingencyPlanPartners implements TasklistPage {
  title = 'Contingency plans'

  fields: Record<string, string> = fields

  partnerAgencyDetails: Array<PartnerAgencyDetails> = []

  constructor(public body: Body) {
    const { namedContact, partnerAgencyName, phoneNumber, roleInPlan } = this.body
    const newPartner: PartnerAgencyDetails = { namedContact, partnerAgencyName, phoneNumber, roleInPlan }
    this.partnerAgencyDetails = this.body.partnerAgencyDetails || []

    if (this.isValid(newPartner)) {
      this.partnerAgencyDetails.push({ namedContact, partnerAgencyName, phoneNumber, roleInPlan })
    }
  }

  previous() {
    return 'arson'
  }

  next() {
    return 'contingency-plan-partners'
  }

  private hasNeccessaryInputs() {
    return Object.keys(this.errors()).length === 0
  }

  private isDuplicate(record: Record<string, string>) {
    return this.partnerAgencyDetails.some(partner =>
      Object.entries(record).every(([key, value]) => partner[key] === value),
    )
  }

  private isValid(newPartner: PartnerAgencyDetails) {
    return this.hasNeccessaryInputs() && !this.isDuplicate(newPartner)
  }

  response() {
    return {
      'Contingency plan partners': this.partnerAgencyDetails.map(partner => {
        return this.responseForPartner(partner)
      }),
    }
  }

  private responseForPartner(partner: PartnerAgencyDetails) {
    return Object.entries(partner).reduce((acc, [property, value]) => {
      return {
        [sentenceCase(property)]: value,
        ...acc,
      }
    }, {})
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    Object.keys(fields).forEach(property => {
      if (!this.body[property]) {
        errors[property] = `You must specify a ${lowerCase(property)}`
      }
    })

    return errors
  }
}
