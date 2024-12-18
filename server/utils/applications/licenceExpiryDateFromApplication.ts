import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'

export const licenceExpiryDateFromApplication = (application: Application): string | null => {
  const basicInformation = application.data?.['basic-information']

  if (!basicInformation) return null

  const { licenceExpiryDate = '', selectedDates = [] } = {
    ...basicInformation['relevant-dates'],
  }

  if (selectedDates.includes('licenceExpiryDate') && licenceExpiryDate) {
    return licenceExpiryDate
  }
  return null
}
