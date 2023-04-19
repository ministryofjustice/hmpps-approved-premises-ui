import { contingencyPlanPartnerFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ContingencyPlanPartners, { Body } from './contingencyPlanPartners'

describe('ContingencyPlanPartners', () => {
  const contigencyPlanPartner1 = contingencyPlanPartnerFactory.build()
  const contigencyPlanPartner2 = contingencyPlanPartnerFactory.build()

  const body = {
    ...contigencyPlanPartner1,
    partnerAgencyDetails: [contigencyPlanPartner2],
  }

  describe('title', () => {
    it('should set the title', () => {
      const page = new ContingencyPlanPartners(body)

      expect(page.title).toEqual('Contingency plans')
    })
  })

  describe('body', () => {
    it('should push the form fields into a new item in the partnerAgencyDetails array', () => {
      const page = new ContingencyPlanPartners(body)

      expect(page.partnerAgencyDetails).toEqual([contigencyPlanPartner2, contigencyPlanPartner1])
    })
  })

  describe('if saveAndContinue is falsy ', () => {
    itShouldHaveNextValue(new ContingencyPlanPartners(body), 'contingency-plan-partners')
  })

  describe('if saveAndContinue is truthy ', () => {
    itShouldHaveNextValue(new ContingencyPlanPartners({ saveAndContinue: '1', ...body }), 'contingency-plan-questions')
  })

  itShouldHavePreviousValue(new ContingencyPlanPartners(body), 'additional-circumstances')

  describe('errors', () => {
    it('should return errors when responses are blank if saveAndContinue is falsy', () => {
      const page = new ContingencyPlanPartners({} as Body)

      expect(page.errors()).toEqual({
        namedContact: 'You must specify a named contact',
        partnerAgencyName: 'You must specify a partner agency name',
        phoneNumber: 'You must specify a phone number',
        roleInPlan: 'You must specify a role in plan',
      })
    })

    it('should return an error when there are no partner agencies added and saveAndContinue is truthy', () => {
      const page = new ContingencyPlanPartners({ saveAndContinue: '1' } as Body)

      expect(page.errors()).toEqual({
        partnerAgencyDetails: 'You must add at least one partner agency',
      })
    })

    it('shouldnt return an error if partnerAgencyDetails are added and saveAndContinue is truthy', () => {
      const page = new ContingencyPlanPartners({
        saveAndContinue: '1',
        partnerAgencyDetails: contingencyPlanPartnerFactory.buildList(1),
      } as Body)

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return response', () => {
      const page = new ContingencyPlanPartners(body)

      expect(page.response()).toEqual({
        'Contingency plan partners': [
          {
            'Named contact': contigencyPlanPartner2.namedContact,
            'Partner agency name': contigencyPlanPartner2.partnerAgencyName,
            'Phone number': contigencyPlanPartner2.phoneNumber,
            'Role in plan': contigencyPlanPartner2.roleInPlan,
          },
          {
            'Named contact': contigencyPlanPartner1.namedContact,
            'Partner agency name': contigencyPlanPartner1.partnerAgencyName,
            'Phone number': contigencyPlanPartner1.phoneNumber,
            'Role in plan': contigencyPlanPartner1.roleInPlan,
          },
        ],
      })
    })
  })
})
