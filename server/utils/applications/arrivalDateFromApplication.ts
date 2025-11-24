import type { Cas1Application as Application } from '@approved-premises/api'

export const arrivalDateFromApplication = (application: Application): string | null => {
  const basicInformation = application.data?.['basic-information']

  if (!basicInformation) return null

  const {
    knowReleaseDate = '',
    startDateSameAsReleaseDate = '',
    releaseDate = '',
    startDate = '',
  } = {
    ...basicInformation['release-date'],
    ...basicInformation['placement-date'],
  }

  if (!knowReleaseDate || knowReleaseDate === 'no') {
    return null
  }

  if (knowReleaseDate === 'yes' && startDateSameAsReleaseDate === 'yes') {
    if (!releaseDate) {
      return null
    }

    return releaseDate
  }

  if (startDateSameAsReleaseDate === 'no') {
    if (!startDate) {
      return null
    }

    return startDate
  }

  return null
}
