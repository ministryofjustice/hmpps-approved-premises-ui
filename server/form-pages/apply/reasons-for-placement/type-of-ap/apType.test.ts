import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'

// eslint-disable-next-line import/no-named-as-default
import SelectApType from './apType'

jest.mock('../../../../utils/formUtils')

describe('ApType', () => {
  itShouldHavePreviousValue(new SelectApType({}), 'dashboard')

  describe('when type is set to pipe', () => {
    itShouldHaveNextValue(new SelectApType({ type: 'pipe' }), 'pipe-referral')
  })

  describe('when type is set to esap', () => {
    itShouldHaveNextValue(new SelectApType({ type: 'esap' }), 'managed-by-national-security-division')
  })

  describe('when type is set to standard', () => {
    itShouldHaveNextValue(new SelectApType({ type: 'standard' }), '')
  })

  describe('errors', () => {
    it('should return an empty object if the type is populated', () => {
      const page = new SelectApType({ type: 'standard' })
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the type is not populated', () => {
      const page = new SelectApType({})
      expect(page.errors()).toEqual({ type: 'You must specify an AP type' })
    })
  })

  describe('items', () => {
    it('it calls convertKeyValuePairToRadioItems', () => {
      const page = new SelectApType({})
      page.items()

      expect(convertKeyValuePairToRadioItems).toHaveBeenCalled()
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new SelectApType({ type: 'pipe' })

      expect(page.response()).toEqual({
        [page.title]: 'Psychologically Informed Planned Environment (PIPE)',
      })
    })
  })
})
