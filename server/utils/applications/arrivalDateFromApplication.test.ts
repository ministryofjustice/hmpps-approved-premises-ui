import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { applicationFactory } from '../../testutils/factories'
import { SessionDataError } from '../errors'

describe('arrivalDateFromApplication', () => {
  it('returns the arrival date when the release date is known and is the same as the start date', () => {
    const application = applicationFactory.build({
      data: {
        'basic-information': {
          'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
          'placement-date': { startDateSameAsReleaseDate: 'yes' },
        },
      },
    })
    expect(arrivalDateFromApplication(application)).toEqual('2022-11-14')
  })

  it('returns the arrival date when the release date is known but there is a different start date', () => {
    const application = applicationFactory.build({
      data: {
        'basic-information': {
          'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
          'placement-date': { startDateSameAsReleaseDate: 'no', startDate: '2023-10-13' },
        },
      },
    })

    expect(arrivalDateFromApplication(application)).toEqual('2023-10-13')
  })

  it('throws an error or returns null when the release date is not known', () => {
    const application = applicationFactory.build({
      data: {
        'basic-information': {
          'release-date': { knowReleaseDate: 'no' },
        },
      },
    })

    expect(() => arrivalDateFromApplication(application)).toThrow(new SessionDataError('No known release date'))
    expect(arrivalDateFromApplication(application, false)).toEqual(null)
  })
})
