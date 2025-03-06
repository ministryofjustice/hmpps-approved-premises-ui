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

export type Body = {
  partnerAgencyDetails: Array<PartnerAgencyDetails>
}

type PartialBody = {
  partnerAgencyDetails: Array<Partial<PartnerAgencyDetails>>
}

@Page({
  name: 'contingency-plan-partners',
  bodyProperties: ['partnerAgencyDetails'],
})
export default class ContingencyPlanPartners implements TasklistPage {
  title = 'Contingency plans'

  fields: Record<string, string> = fields

  constructor(private _body: PartialBody) {}

  public set body(value: PartialBody) {
    this._body = {
      partnerAgencyDetails: (value.partnerAgencyDetails || []).filter(
        agency => Object.values(agency).filter(i => i.length > 0).length > 0,
      ),
    } as Body
  }

  public get body(): Body {
    return this._body as Body
  }

  previous() {
    return 'additional-circumstances'
  }

  next() {
    return 'contingency-plan-questions'
  }

  response() {
    return {
      'Contingency plan partners': this.body.partnerAgencyDetails.map(partner => {
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

    if (this.body.partnerAgencyDetails.length === 0) {
      errors.partnerAgencyDetails = 'You must add at least one partner agency'
      return errors
    }

    this.body.partnerAgencyDetails.forEach((detail: PartnerAgencyDetails, i: number) => {
      Object.keys(fields).forEach((property: keyof PartnerAgencyDetails) => {
        if (!detail?.[property]) {
          errors[`partnerAgencyDetails_${i}_${property}` as keyof typeof errors] =
            `You must specify a ${lowerCase(property)}`
        }
      })
    })

    return errors
  }
}
