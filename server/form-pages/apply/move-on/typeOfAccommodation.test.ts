import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import TypeOfAccommodation, { accommodationType } from './typeOfAccommodation'

import { applicationFactory, personFactory, restrictedPersonFactory } from '../../../testutils/factories'

jest.mock('../../../utils/formUtils', () => ({
  convertKeyValuePairToRadioItems: jest
    .fn()
    .mockImplementation(() => [{ value: 'other' }, { value: 'anotherTypeofAccommodation' }]),
}))

describe('TypeOfaccommodation', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })
  describe('title', () => {
    expect(new TypeOfAccommodation({}, application).title).toBe('Placement duration and move on')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new TypeOfAccommodation(
        {
          accommodationType: 'other',
          otherAccommodationType: 'hotel',
        },
        application,
      )

      expect(page.body).toEqual({
        accommodationType: 'other',
        otherAccommodationType: 'hotel',
      })
    })
  })

  describe('question', () => {
    it('it will contain the persons name if they are a full person', () => {
      expect(new TypeOfAccommodation({}, application).question).toBe(
        `What type of accommodation will ${person.name} have when they leave the AP?`,
      )
    })

    it('it will not contain the persons name if they are a restricted person', () => {
      const applicationWithRestrictedPerson = { ...application, person: restrictedPersonFactory.build() }
      expect(new TypeOfAccommodation({}, applicationWithRestrictedPerson).question).toBe(
        `What type of accommodation will the person have when they leave the AP?`,
      )
    })
  })

  describe('if the response is foreignNational the user is taken to the foreign-national page', () => {
    itShouldHaveNextValue(
      new TypeOfAccommodation({ accommodationType: 'foreignNational' }, application),
      'foreign-national',
    )
  })
  describe('if the response is not foreign national the user is take to the task list', () => {
    itShouldHaveNextValue(new TypeOfAccommodation({ accommodationType: 'cas3' }, application), '')
  })
  itShouldHavePreviousValue(new TypeOfAccommodation({}, application), 'plans-in-place')

  describe('errors', () => {
    it('returns an error if no accommodation type is selected', () => {
      const page = new TypeOfAccommodation({}, application)

      expect(page.errors()).toEqual({ accommodationType: 'You must specify a type of accommodation' })
    })

    it('returns an error if the accommodation is "other" but no other type is specified', () => {
      const page = new TypeOfAccommodation({ accommodationType: 'other' }, application)

      expect(page.errors()).toEqual({ otherAccommodationType: 'You must specify the type of accommodation' })
    })
  })

  describe('response', () => {
    const page = new TypeOfAccommodation(
      {
        accommodationType: 'other',
        otherAccommodationType: 'Some other accommodation',
      },
      application,
    )

    expect(page.response()).toEqual({
      'What type of accommodation will John Wayne have when they leave the AP?': 'Other, please specify',
      'Other, please specify': 'Some other accommodation',
    })
  })

  describe('items', () => {
    it('calls convertKeyValuePairToRadioItems with the correct items', () => {
      const items = new TypeOfAccommodation({ accommodationType: 'privateRented' }, application).items()

      expect(convertKeyValuePairToRadioItems).toHaveBeenCalledWith(accommodationType, 'privateRented')
      expect(items).not.toContain('other')
    })
  })
})
