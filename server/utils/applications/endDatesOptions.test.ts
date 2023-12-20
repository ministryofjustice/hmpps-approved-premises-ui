import { fromPartial } from '@total-typescript/shoehorn'
import { endDatesOptions } from './endDatesOptions'

describe('endDatesOptions', () => {
  it('should return an array of CheckBoxItems with correct properties', () => {
    const conditionals = ['<div>Conditional 1</div>', '<div>Conditional 2</div>', '<div>Conditional 3</div>']

    const expected = [
      {
        text: 'Parole eligibility date',
        value: 'paroleEligbilityDate',
        conditional: { html: '<div>Conditional 1</div>' },
      },
      {
        text: 'Home Detention Curfew (HDC) date',
        value: 'homeDetentionCurfewDate',
        conditional: { html: '<div>Conditional 2</div>' },
      },
      {
        text: 'Licence expiry date',
        value: 'licenceExpiryDate',
        conditional: { html: '<div>Conditional 3</div>' },
      },
    ]

    const result = endDatesOptions(
      fromPartial({
        paroleEligbilityDate: 'Parole eligibility date',
        homeDetentionCurfewDate: 'Home Detention Curfew (HDC) date',
        licenceExpiryDate: 'Licence expiry date',
      }),
      conditionals,
    )
    expect(result).toEqual(expected)
  })
})
