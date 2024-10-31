import { ApType } from '@approved-premises/api'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import * as formUtils from '../../../../utils/formUtils'

import SelectApType, { apTypeHintText, apTypes } from './apType'
import { apTypeLabels } from '../../../../utils/apTypeLabels'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

describe('SelectApType', () => {
  const application = applicationFactory.build()

  itShouldHavePreviousValue(new SelectApType({}, application), 'dashboard')

  describe.each<[ApType, string]>([
    ['normal', ''],
    ['esap', 'managed-by-national-security-division'],
    ['mhapElliottHouse', ''],
    ['mhapStJosephs', ''],
    ['pipe', 'pipe-referral'],
    ['rfap', 'rfap-details'],
  ])('when the type is set to %s', (type, nextPage) => {
    itShouldHaveNextValue(new SelectApType({ type }, application), nextPage)
  })

  describe('errors', () => {
    it('should return an empty object if the type is populated', () => {
      const page = new SelectApType({ type: 'normal' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the type is not populated', () => {
      const page = new SelectApType({}, application)
      expect(page.errors()).toEqual({ type: 'You must specify an AP type' })
    })
  })

  describe('items', () => {
    beforeEach(() => {
      jest.spyOn(formUtils, 'convertArrayToRadioItems')
    })

    it('it calls convertKeyValuePairToRadioItems', () => {
      const page = new SelectApType({}, application)
      const items = page.items()

      expect(formUtils.convertArrayToRadioItems).toHaveBeenCalledWith(apTypes, undefined, apTypeLabels, apTypeHintText)
      expect(items).toHaveLength(6)
    })

    describe("when the application is for the Women's Estate", () => {
      it('should restrict the application types available', () => {
        const person = personFactory.build({ sex: 'Female' })
        const applicationWomens = applicationFactory.build({ person })

        const page = new SelectApType({}, applicationWomens)
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
      const person = personFactory.build({ sex: 'Female' })
      const applicationWomens = applicationFactory.build({ person })

      const page = new SelectApType({}, applicationWomens)

      expect(page.isWomensApplication()).toBe(true)
    })

    it("returns false if the application is not for the Women's Estate", () => {
      const person = personFactory.build({ sex: 'Male' })
      const applicationWomens = applicationFactory.build({ person })

      const page = new SelectApType({}, applicationWomens)

      expect(page.isWomensApplication()).toBe(false)
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new SelectApType({ type: 'pipe' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Psychologically Informed Planned Environment (PIPE)',
      })
    })

    it('should return a translated version of the response', () => {
      const page = new SelectApType({ type: 'standard' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Standard AP',
      })
    })
  })
})
