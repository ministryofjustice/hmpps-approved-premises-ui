import { PartnerAgencyDetails } from '@approved-premises/ui'
import { contingencyPlanPartnerFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import ContingencyPlanPartners from './contingencyPlanPartners'

describe('ContingencyPlanPartners', () => {
  const contigencyPlanPartner1 = contingencyPlanPartnerFactory.build()
  const contigencyPlanPartner2 = contingencyPlanPartnerFactory.build()

  const body = {
    partnerAgencyDetails: [contigencyPlanPartner1, contigencyPlanPartner2, [] as Partial<PartnerAgencyDetails>],
  }

  describe('title', () => {
    it('should set the title', () => {
      const page = new ContingencyPlanPartners(body)

      expect(page.title).toEqual('Contingency plans')
    })
  })

  describe('body', () => {
    it('should set the body correctly', () => {
      const page = new ContingencyPlanPartners(body)

      expect(page.body.partnerAgencyDetails).toEqual([contigencyPlanPartner1, contigencyPlanPartner2])
    })
  })

  itShouldHaveNextValue(new ContingencyPlanPartners(body), 'contingency-plan-questions')

  itShouldHavePreviousValue(new ContingencyPlanPartners(body), 'additional-circumstances')

  describe('errors', () => {
    it('should return errors when responses are blank', () => {
      const page = new ContingencyPlanPartners({
        partnerAgencyDetails: [
          { namedContact: 'Someone' },
          { partnerAgencyName: 'Agency name', phoneNumber: '123', roleInPlan: 'Role' },
        ],
      })

      expect(page.errors()).toEqual({
        partnerAgencyDetails_0_partnerAgencyName: 'You must specify a partner agency name',
        partnerAgencyDetails_0_phoneNumber: 'You must specify a phone number',
        partnerAgencyDetails_0_roleInPlan: 'You must specify a role in plan',
        partnerAgencyDetails_1_namedContact: 'You must specify a named contact',
      })
    })

    it('should return an error when there are no partner agencies are specified', () => {
      const page = new ContingencyPlanPartners({ partnerAgencyDetails: [] })

      expect(page.errors()).toEqual({
        partnerAgencyDetails: 'You must add at least one partner agency',
      })
    })
  })

  describe('response', () => {
    it('should return response', () => {
      const page = new ContingencyPlanPartners(body)

      expect(page.response()).toEqual({
        'Contingency plan partners': [
          {
            'Named contact': contigencyPlanPartner1.namedContact,
            'Partner agency name': contigencyPlanPartner1.partnerAgencyName,
            'Phone number': contigencyPlanPartner1.phoneNumber,
            'Role in plan': contigencyPlanPartner1.roleInPlan,
          },
          {
            'Named contact': contigencyPlanPartner2.namedContact,
            'Partner agency name': contigencyPlanPartner2.partnerAgencyName,
            'Phone number': contigencyPlanPartner2.phoneNumber,
            'Role in plan': contigencyPlanPartner2.roleInPlan,
          },
        ],
      })
    })
  })
})
