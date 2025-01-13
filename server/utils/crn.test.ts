import { isValidCrn } from './crn'

describe('CRN utils', () => {
  it.each(['foo', '', 'X123', 'C6783456', '999888', ' X123456 ', 'x320741'])(
    `considers "%s" an invalid CRN`,
    testCrn => {
      expect(isValidCrn(testCrn)).toEqual(false)
    },
  )

  it.each(['C456123', 'X678543'])('considers "%s" a valid CRN', testCrn => {
    expect(isValidCrn(testCrn)).toEqual(true)
  })
})
