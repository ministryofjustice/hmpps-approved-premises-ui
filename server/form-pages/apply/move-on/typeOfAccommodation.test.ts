import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared'

import TypeOfAccommodation, { accommodationType } from './typeOfAccommodation'

jest.mock('../../../utils/formUtils', () => ({
  convertKeyValuePairToRadioItems: jest
    .fn()
    .mockImplementation(() => [{ value: 'other' }, { value: 'anotherTypeofAccommodation' }]),
}))

describe('TypeOfaccommodation', () => {
  describe('title', () => {
    expect(new TypeOfAccommodation({}).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new TypeOfAccommodation({
        accommodationType: 'other',
        otherAccommodationType: 'hotel',
      })

      expect(page.body).toEqual({
        accommodationType: 'other',
        otherAccommodationType: 'hotel',
      })
    })
  })

  describe('if the response is foreignNational the user is taken to the foreign-national page', () => {
    itShouldHaveNextValue(new TypeOfAccommodation({ accommodationType: 'foreignNational' }), 'foreign-national')
  })
  describe('if the response is not foreign national the user is take to the task list', () => {
    itShouldHaveNextValue(new TypeOfAccommodation({ accommodationType: 'cas3' }), '')
  })
  itShouldHavePreviousValue(new TypeOfAccommodation({}), 'plans-in-place')

  describe('errors', () => {
    it('returns an error if no accommodation type is selected', () => {
      const page = new TypeOfAccommodation({})

      expect(page.errors()).toEqual({ accommodationType: 'You must specify a type of accommodation' })
    })

    it('returns an error if the accommodation is "other" but no other type is specified', () => {
      const page = new TypeOfAccommodation({ accommodationType: 'other' })

      expect(page.errors()).toEqual({ otherAccommodationType: 'You must specify the type of accommodation' })
    })
  })

  describe('response', () => {
    const page = new TypeOfAccommodation({
      accommodationType: 'other',
      otherAccommodationType: 'Some other accommodation',
    })

    expect(page.response()).toEqual({
      'What type of accommodation will the person have when they leave the AP?': 'Other, please specify',
      'Other, please specify': 'Some other accommodation',
    })
  })

  describe('items', () => {
    it('calls convertKeyValuePairToRadioItems with the correct items', () => {
      const items = new TypeOfAccommodation({ accommodationType: 'privateRented' }).items()

      expect(convertKeyValuePairToRadioItems).toHaveBeenCalledWith(accommodationType, 'privateRented')
      expect(items).not.toContain('other')
    })
  })
})
