import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'
import ConvictedOffences, { responses } from './convictedOffences'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

jest.mock('../../../utils/formUtils')

describe('ConvictedOffences', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ConvictedOffences({ response: 'yes', something: 'else' }, application)

      expect(page.body).toEqual({ response: 'yes' })
    })
  })

  itShouldHavePreviousValue(new ConvictedOffences({}, application), 'risk-management-features')

  describe('if the response is yes', () => {
    itShouldHaveNextValue(new ConvictedOffences({ response: 'yes' }, application), 'type-of-convicted-offence')
  })

  describe('if the response is no', () => {
    itShouldHaveNextValue(new ConvictedOffences({ response: 'no' }, application), 'rehabilitative-interventions')
  })

  describe('errors', () => {
    it('should return an empty object if the response is populated', () => {
      const page = new ConvictedOffences({ response: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the response is not populated', () => {
      const page = new ConvictedOffences({}, application)
      expect(page.errors()).toEqual({
        response: 'You must specify if John Wayne has been convicted of any of the listed offences',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new ConvictedOffences({ response: 'yes' }, application)

      expect(page.response()).toEqual({
        'Has John Wayne ever been convicted of any arson offences, sexual offences, hate crimes or non-sexual offences against children?':
          'Yes',
      })
    })
  })

  describe('items', () => {
    it('calls convertKeyValuePairToRadioItems with the correct args', () => {
      new ConvictedOffences({ response: 'yes' }, application).items()
      expect(convertKeyValuePairToRadioItems).toBeCalledWith(responses, 'yes')
    })
  })
})
