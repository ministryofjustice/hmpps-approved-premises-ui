import contingencyPlanPartnersFactory from '../../../../testutils/factories/contingencyPlanPartner'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ContingencyPlanPartners, { Body } from './contingencyPlanPartners'

describe('ContingencyPlanPartners', () => {
  const contigencyPlanPartner1 = contingencyPlanPartnersFactory.build()
  const contigencyPlanPartner2 = contingencyPlanPartnersFactory.build()

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

  itShouldHaveNextValue(new ContingencyPlanPartners(body), '')

  itShouldHavePreviousValue(new ContingencyPlanPartners(body), 'arson')

  describe('errors', () => {
    it('should return errors when responses are blank', () => {
      const page = new ContingencyPlanPartners({} as Body)

      expect(page.errors()).toEqual({
        namedContact: 'You must specify a named contact',
        partnerAgencyName: 'You must specify a partner agency name',
        phoneNumber: 'You must specify a phone number',
        roleInPlan: 'You must specify a role in plan',
      })
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
