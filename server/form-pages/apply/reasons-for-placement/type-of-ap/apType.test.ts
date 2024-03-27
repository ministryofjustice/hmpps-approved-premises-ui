import { ApType } from '@approved-premises/api'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { convertArrayToRadioItems } from '../../../../utils/formUtils'

import SelectApType, { apTypeHintText, apTypeLabels, apTypes } from './apType'

jest.mock('../../../../utils/formUtils')

describe('SelectApType', () => {
  itShouldHavePreviousValue(new SelectApType({}), 'dashboard')

  describe.each<[ApType, string]>([
    ['normal', ''],
    ['esap', 'managed-by-national-security-division'],
    ['mhapElliottHouse', ''],
    ['mhapStJosephs', ''],
    ['pipe', 'pipe-referral'],
    ['rfap', ''],
  ])('when the type is set to %s', (type, nextPage) => {
    itShouldHaveNextValue(new SelectApType({ type }), nextPage)
  })

  describe('errors', () => {
    it('should return an empty object if the type is populated', () => {
      const page = new SelectApType({ type: 'normal' })
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

      expect(convertArrayToRadioItems).toHaveBeenCalledWith(apTypes, undefined, apTypeLabels, apTypeHintText)
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
