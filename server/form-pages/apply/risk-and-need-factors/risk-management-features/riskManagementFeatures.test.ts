import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import RiskManagementFeatures from './riskManagementFeatures'

jest.mock('../../../../utils/formUtils')

describe('RiskManagementFeatures', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new RiskManagementFeatures({
        manageRiskDetails: 'some details',
        additionalFeaturesDetails: 'some features',
      })

      expect(page.body).toEqual({ additionalFeaturesDetails: 'some features', manageRiskDetails: 'some details' })
    })
  })

  itShouldHavePreviousValue(new RiskManagementFeatures({}), 'dashboard')

  itShouldHaveNextValue(new RiskManagementFeatures({}), 'convicted-offences')

  describe('errors', () => {
    it('should return an empty object if the manageRiskDetails are populated', () => {
      const page = new RiskManagementFeatures({ manageRiskDetails: 'some details' })
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the details are not populated', () => {
      const page = new RiskManagementFeatures({ additionalFeaturesDetails: 'some features' })
      expect(page.errors()).toEqual({
        manageRiskDetails: 'You must describe why an AP placement is needed to manage the risk of the person',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new RiskManagementFeatures({
        manageRiskDetails: 'some details',
        additionalFeaturesDetails: 'some features',
      })

      expect(page.response()).toEqual({
        'Describe why an AP placement is needed to manage the risk of the person': 'some details',
        'Provide details of any additional measures that will be necessary for the management of risk': 'some features',
      })
    })
  })
})
