import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import applicationFactory from '../../../../testutils/factories/application'
import personFactory from '../../../../testutils/factories/person'

import Covid from './covid'

describe('Covid', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })
  const previousPage = 'previousPage'

  describe('title', () => {
    expect(new Covid({}, application, '').title).toBe('Healthcare information')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Covid(
        {
          fullyVaccinated: 'yes',
          highRisk: 'yes',
          additionalCovidInfo: 'some info',
        },
        application,
        previousPage,
      )
      expect(page.body).toEqual({
        fullyVaccinated: 'yes',
        highRisk: 'yes',
        additionalCovidInfo: 'some info',
      })
    })
  })

  itShouldHaveNextValue(new Covid({}, application, previousPage), '')
  itShouldHavePreviousValue(new Covid({}, application, previousPage), 'previousPage')

  describe('errors', () => {
    const page = new Covid({}, application, '')
    expect(page.errors()).toEqual({
      fullyVaccinated: 'You must confirm if John Wayne has been fully vaccinated',
      highRisk: 'You must confirm if John Wayne is at high risk from COVID-19',
    })
  })

  describe('response', () => {
    const page = new Covid(
      {
        fullyVaccinated: 'yes',
        highRisk: 'yes',
        additionalCovidInfo: 'Some info',
      },
      application,
      '',
    )

    expect(page.response()).toEqual({
      'Has John Wayne been fully vaccinated for COVID-19?': 'Yes',
      'Is the John Wayne at high risk from COVID-19?': 'Yes',
      'Other considerations and comments on COVID-19': 'Some info',
    })
  })
})
