import { ApType } from '@approved-premises/api'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import * as formUtils from '../../../../utils/formUtils'

import SelectApType, { apTypeHintText } from './apType'
import { apTypeLabels } from '../../../../utils/apTypeLabels'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { apTypes } from '../../../../utils/placementCriteriaUtils'

describe('SelectApType', () => {
  const applicationMensEstate = applicationFactory.build({
    person: personFactory.build({ sex: 'Male' }),
  })
  const applicationWomensEstate = applicationFactory.build({
    person: personFactory.build({ sex: 'Female' }),
  })

  itShouldHavePreviousValue(new SelectApType({}, applicationMensEstate), 'dashboard')

  describe.each<[ApType, string]>([
    ['normal', ''],
    ['esap', 'managed-by-national-security-division'],
    ['mhapElliottHouse', ''],
    ['mhapStJosephs', ''],
    ['pipe', 'pipe-referral'],
    ['rfap', 'rfap-details'],
  ])('when the type is set to %s', (type, nextPage) => {
    itShouldHaveNextValue(new SelectApType({ type }, applicationMensEstate), nextPage)
  })

  describe('errors', () => {
    it('should return an empty object if the type is populated', () => {
      const page = new SelectApType({ type: 'normal' }, applicationMensEstate)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the type is not populated', () => {
      const page = new SelectApType({}, applicationMensEstate)
      expect(page.errors()).toEqual({ type: 'You must specify an AP type' })
    })

    it("should return an error if the type is not available for a women's application", () => {
      const page = new SelectApType({ type: 'mhapElliottHouse' }, applicationWomensEstate)

      expect(page.errors()).toEqual({ type: 'You must specify an AP type' })
    })
  })

  describe('items', () => {
    beforeEach(() => {
      jest.spyOn(formUtils, 'convertArrayToRadioItems')
    })

    it('it calls convertKeyValuePairToRadioItems', () => {
      const page = new SelectApType({}, applicationMensEstate)
      const items = page.items()

      expect(formUtils.convertArrayToRadioItems).toHaveBeenCalledWith(apTypes, undefined, apTypeLabels, apTypeHintText)
      expect(items).toHaveLength(6)
    })

    describe("when the application is for the Women's Estate", () => {
      it('should restrict the application types available', () => {
        const page = new SelectApType({}, applicationWomensEstate)
        const items = page.items()

        expect(items).toHaveLength(3)
        expect(items).toEqual([
          {
            value: 'normal',
            text: 'Standard AP',
            checked: false,
          },
          {
            value: 'pipe',
            text: 'Psychologically Informed Planned Environment (PIPE)',
            checked: false,
          },
          {
            value: 'esap',
            text: 'Enhanced Security AP (ESAP)',
            checked: false,
          },
        ])
      })
    })
  })

  describe('isWomensApplication', () => {
    it("returns true if the application is for the Women's Estate", () => {
      const page = new SelectApType({}, applicationWomensEstate)

      expect(page.isWomensApplication).toBe(true)
    })

    it("returns false if the application is for the Men's Estate", () => {
      const page = new SelectApType({}, applicationMensEstate)

      expect(page.isWomensApplication).toBe(false)
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new SelectApType({ type: 'pipe' }, applicationMensEstate)

      expect(page.response()).toEqual({
        [page.title]: 'Psychologically Informed Planned Environment (PIPE)',
      })
    })

    it('should return a translated version of the response', () => {
      const page = new SelectApType({ type: 'standard' }, applicationMensEstate)

      expect(page.response()).toEqual({
        [page.title]: 'Standard AP',
      })
    })
  })
})
