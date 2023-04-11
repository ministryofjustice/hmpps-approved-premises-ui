import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'
import { PartnerAgencyDetails } from '../../../server/@types/ui'

export default class ContingencyPlanPartnersPage extends ApplyPage {
  contigencyPlanPartners: Array<PartnerAgencyDetails>

  constructor(application: ApprovedPremisesApplication, contigencyPlanPartners) {
    super(
      'Contingency plans',
      application,
      'further-considerations',
      'contingency-plan-partners',
      paths.applications.show({ id: application.id }),
    )
    this.contigencyPlanPartners = contigencyPlanPartners
  }

  completeForm() {
    this.contigencyPlanPartners.forEach(partner => {
      this.getTextInputByIdAndEnterDetails('partnerAgencyName', partner.partnerAgencyName)
      this.getTextInputByIdAndEnterDetails('namedContact', partner.namedContact)
      this.getTextInputByIdAndEnterDetails('phoneNumber', partner.phoneNumber)
      this.getTextInputByIdAndEnterDetails('roleInPlan', partner.roleInPlan)
      cy.get('button').contains('Add another agency').click()
    })

    cy.get('dl').each(() => {
      this.contigencyPlanPartners.forEach(partner => {
        this.assertDefinition('Named contact', partner.namedContact)
        this.assertDefinition('Name of partner agency', partner.partnerAgencyName)
        this.assertDefinition('Contact details (phone)', partner.phoneNumber)
        this.assertDefinition('Role in contingency plan', partner.roleInPlan)
      })
    })
  }

  clickSubmit(): void {
    cy.get('button').contains('Save and continue').click()
  }
}
