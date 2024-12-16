import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { licenceExpiryDateFromApplication } from './licenceExpiryDateFromApplication'

import { applicationFactory } from '../../testutils/factories'

jest.mock('./arrivalDateFromApplication')

describe('licenceExpiryDateFromApplication', () => {
  let application: ApprovedPremisesApplication
  const licenceExpiryDate = '2024-12-14'

  beforeEach(() => {
    application = applicationFactory.build({})
  })

  it('returns the licenceExpiryDate from the application if the licenceExpiryDate date has been selected', () => {
    application.data = {
      'basic-information': { 'relevant-dates': { licenceExpiryDate, selectedDates: ['licenceExpiryDate'] } },
    }
    expect(licenceExpiryDateFromApplication(application)).toEqual(licenceExpiryDate)
  })
  it('returns null from the application if the date has not been selected', () => {
    application.data = {
      'basic-information': { 'relevant-dates': { licenceExpiryDate, selectedDates: [] } },
    }
    expect(licenceExpiryDateFromApplication(application)).toEqual(null)
  })
  it('returns null from the application if the date has been selected but not populated', () => {
    application.data = {
      'basic-information': { 'relevant-dates': { selectedDates: ['licenceExpiryDate'] } },
    }
    expect(licenceExpiryDateFromApplication(application)).toEqual(null)
  })
})
