import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import ConvictedOffences, { responses } from './convictedOffences'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'

jest.mock('../../../../utils/formUtils')

describe('ConvictedOffences', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new ConvictedOffences({ response: 'yes' })

      expect(page.body).toEqual({ response: 'yes' })
    })
  })

  itShouldHavePreviousValue(new ConvictedOffences({}), 'risk-management-features')

  describe('if the response is yes', () => {
    itShouldHaveNextValue(new ConvictedOffences({ response: 'yes' }), 'date-of-offence')
  })

  describe('if the response is no', () => {
    itShouldHaveNextValue(new ConvictedOffences({ response: 'no' }), 'rehabilitative-interventions')
  })

  describe('errors', () => {
    it('should return an empty object if the response is populated', () => {
      const page = new ConvictedOffences({ response: 'no' })
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the response is not populated', () => {
      const page = new ConvictedOffences({})
      expect(page.errors()).toEqual({
        response: 'You must specify if the person has been convicted of any of the listed offences',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new ConvictedOffences({ response: 'yes' })

      expect(page.response()).toEqual({
        'Has the person ever been convicted of any sexual offences, hate crimes or non-sexual offences against children?':
          'Yes',
      })
    })
  })

  describe('items', () => {
    it('calls convertKeyValuePairToRadioItems with the correct args', () => {
      new ConvictedOffences({ response: 'yes' }).items()
      expect(convertKeyValuePairToRadioItems).toBeCalledWith(responses, 'yes')
    })
  })
})
