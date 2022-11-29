import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import RiskManagementFeatures from './riskManagementFeatures'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

jest.mock('../../../utils/formUtils')

describe('RiskManagementFeatures', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new RiskManagementFeatures(
        { manageRiskDetails: 'some details', additionalFeaturesDetails: 'some features' },
        application,
      )

      expect(page.body).toEqual({ additionalFeaturesDetails: 'some features', manageRiskDetails: 'some details' })
    })
  })

  itShouldHavePreviousValue(new RiskManagementFeatures({}, application), '')

  itShouldHaveNextValue(new RiskManagementFeatures({}, application), 'convicted-offences')

  describe('errors', () => {
    it('should return an empty object if the manageRiskDetails are populated', () => {
      const page = new RiskManagementFeatures({ manageRiskDetails: 'some details' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the details are not populated', () => {
      const page = new RiskManagementFeatures({ additionalFeaturesDetails: 'some features' }, application)
      expect(page.errors()).toEqual({
        manageRiskDetails: 'You must describe why an AP placement is needed to manage the risk of John Wayne',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new RiskManagementFeatures(
        { manageRiskDetails: 'some details', additionalFeaturesDetails: 'some features' },
        application,
      )

      expect(page.response()).toEqual({
        'Describe why an AP placement is needed to manage the risk of John Wayne': 'some details',
        'Provide details of any additional measures that will be necessary for the management of risk': 'some features',
      })
    })
  })
})
