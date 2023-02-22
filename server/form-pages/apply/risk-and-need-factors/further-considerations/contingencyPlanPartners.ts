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
  saveAndContinue?: string
  partnerAgencyDetails: Array<PartnerAgencyDetails>
}

@Page({
  name: 'contingency-plan-partners',
  bodyProperties: [
    'partnerAgencyName',
    'namedContact',
    'phoneNumber',
    'roleInPlan',
    'partnerAgencyDetails',
    'saveAndContinue',
  ],
})
export default class ContingencyPlanPartners implements TasklistPage {
  title = 'Contingency plans'

  fields: Record<string, string> = fields

  partnerAgencyDetails: Array<PartnerAgencyDetails> = []

  saveAndContinue: string | undefined

  constructor(public body: Body) {
    const { namedContact, partnerAgencyName, phoneNumber, roleInPlan } = this.body
    const newPartner: PartnerAgencyDetails = { namedContact, partnerAgencyName, phoneNumber, roleInPlan }
    this.partnerAgencyDetails = this.body.partnerAgencyDetails || []

    if (this.isValid(newPartner)) {
      this.partnerAgencyDetails.push({ namedContact, partnerAgencyName, phoneNumber, roleInPlan })
    }
    this.saveAndContinue = body.saveAndContinue
  }

  previous() {
    return 'arson'
  }

  next() {
    return this.saveAndContinue ? '' : 'contingency-plan-partners'
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

    if (this.saveAndContinue) {
      if (this.partnerAgencyDetails.length) return errors
      errors.partnerAgencyDetails = 'You must add at least one partner agency'
      return errors
    }

    Object.keys(fields).forEach(property => {
      if (!this.body[property]) {
        errors[property] = `You must specify a ${lowerCase(property)}`
      }
    })

    return errors
  }
}
