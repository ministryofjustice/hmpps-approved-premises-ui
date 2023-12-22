import { fromPartial } from '@total-typescript/shoehorn'
import { relevantDatesOptions } from './relevantDatesOptions'

describe('relevantDatesOptions', () => {
  it('should return an array of CheckBoxItems with correct properties', () => {
    const conditionals = ['<div>Conditional 1</div>', '<div>Conditional 2</div>', '<div>Conditional 3</div>']

    const expected = [
      {
        text: 'Parole eligibility date',
        value: 'paroleEligibilityDate',
        checked: false,
        conditional: { html: '<div>Conditional 1</div>' },
      },
      {
        text: 'Home Detention Curfew (HDC) date',
        value: 'homeDetentionCurfewDate',
        checked: false,
        conditional: { html: '<div>Conditional 2</div>' },
      },
      {
        text: 'Licence expiry date',
        value: 'licenceExpiryDate',
        checked: true,
        conditional: { html: '<div>Conditional 3</div>' },
      },
    ]

    const result = relevantDatesOptions(
      fromPartial({
        paroleEligibilityDate: 'Parole eligibility date',
        homeDetentionCurfewDate: 'Home Detention Curfew (HDC) date',
        licenceExpiryDate: 'Licence expiry date',
      }),
      conditionals,
      ['licenceExpiryDate'],
    )
    expect(result).toEqual(expected)
  })
})
