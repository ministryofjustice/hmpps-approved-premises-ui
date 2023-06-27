import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import Covid from './covid'

describe('Covid', () => {
  const previousPage = 'previousPage'

  describe('title', () => {
    expect(new Covid({}, '').title).toBe('COVID information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Covid(
        {
          boosterEligibility: 'yes',
          boosterEligibilityDetail: 'some detail',
          immunosuppressed: 'yes',
        },
        previousPage,
      )
      expect(page.body).toEqual({
        boosterEligibility: 'yes',
        boosterEligibilityDetail: 'some detail',
        immunosuppressed: 'yes',
      })
    })
  })

  itShouldHaveNextValue(new Covid({}, previousPage), '')
  itShouldHavePreviousValue(new Covid({}, previousPage), 'previousPage')

  describe('errors', () => {
    const page = new Covid({}, '')
    expect(page.errors()).toEqual({
      boosterEligibility: 'You must confirm if the person is eligible for a COVID-19 booster',
      immunosuppressed:
        'You must confirm if the person is immunosuppressed, eligible for nMAB treatment or higher risk',
    })
  })

  describe('response', () => {
    const page = new Covid(
      {
        boosterEligibility: 'yes',
        boosterEligibilityDetail: 'some detail',
        immunosuppressed: 'yes',
      },
      '',
    )

    expect(page.response()).toEqual({
      'Is the person eligible for COVID-19 vaccination boosters?': 'Yes - some detail',
      'Is the person immunosuppressed, eligible for nMAB treatment or higher risk as per the definitions in the COVID-19 guidance?':
        'Yes',
    })
  })
})
