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
    this.contigencyPlanPartners.forEach((partner, i) => {
      this.getTextInputByIdAndEnterDetails(`partnerAgencyDetails_${i}_partnerAgencyName`, partner.partnerAgencyName)
      this.getTextInputByIdAndEnterDetails(`partnerAgencyDetails_${i}_namedContact`, partner.namedContact)
      this.getTextInputByIdAndEnterDetails(`partnerAgencyDetails_${i}_phoneNumber`, partner.phoneNumber)
      this.getTextInputByIdAndEnterDetails(`partnerAgencyDetails_${i}_roleInPlan`, partner.roleInPlan)
      cy.get('button').contains('Add another agency').click()
    })
  }

  clickSubmit(): void {
    cy.get('button').contains('Save and continue').click()
  }
}
