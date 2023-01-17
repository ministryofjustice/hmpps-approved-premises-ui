import applicationFactory from '../testutils/factories/application'
import { tierEnvelopeFactory } from '../testutils/factories/risks'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import { DateFormats } from './dateUtils'
import { tierBadge } from './personUtils'

import {
  getResponses,
  getPage,
  getArrivalDate,
  dashboardTableRows,
  documentsFromApplication,
  overwriteApplicationDocuments,
} from './applicationUtils'
import { SessionDataError, UnknownPageError } from './errors'
import documentFactory from '../testutils/factories/document'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

Apply.pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('applicationUtils', () => {
  describe('getResponses', () => {
    it('returns the responses from all answered questions', () => {
      FirstPage.mockReturnValue({
        response: () => {
          return { foo: 'bar' }
        },
      })

      SecondPage.mockReturnValue({
        response: () => {
          return { bar: 'foo' }
        },
      })

      const application = applicationFactory.build()
      application.data = { 'basic-information': { first: '', second: '' } }

      expect(getResponses(application)).toEqual({ 'basic-information': [{ foo: 'bar' }, { bar: 'foo' }] })
    })
  })

  describe('getPage', () => {
    it('should return a page if it exists', () => {
      expect(getPage('basic-information', 'first')).toEqual(FirstPage)
      expect(getPage('basic-information', 'second')).toEqual(SecondPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('basic-information', 'bar')
      }).toThrow(UnknownPageError)
    })
  })

  describe('getArrivalDate', () => {
    it('returns the arrival date when the release date is known and is the same as the start date', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
            'placement-date': { startDateSameAsReleaseDate: 'yes' },
          },
        },
      })
      expect(getArrivalDate(application)).toEqual('2022-11-14')
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

      expect(getArrivalDate(application)).toEqual('2023-10-13')
    })

    it('throws an error or returns null when the release date is not known', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'no' },
          },
        },
      })

      expect(() => getArrivalDate(application)).toThrow(new SessionDataError('No known release date'))
      expect(getArrivalDate(application, false)).toEqual(null)
    })
  })

  describe('dashboardTableRows', () => {
    it('returns an array of applications as table rows', async () => {
      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))

      const applicationA = applicationFactory.build({
        person: { name: 'A' },
        data: {},
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationFactory.withReleaseDate(arrivalDate).build({
        person: { name: 'A' },
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })}>${applicationA.person.name}</a>`,
          },
          {
            text: applicationA.person.crn,
          },
          {
            html: tierBadge('A1'),
          },
          {
            text: 'N/A',
          },
          {
            text: 'N/A',
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationB.id })}>${applicationB.person.name}</a>`,
          },
          {
            text: applicationB.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            text: DateFormats.isoDateToUIDate(applicationB.submittedAt, { format: 'short' }),
          },
        ],
      ])
    })
  })
  describe('documentsFromApplication', () => {
    it('returns the selected documents if they exist', () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(2)

      application.data['attach-required-documents'] = {
        'attach-documents': {
          selectedDocuments: documents,
        },
      }

      expect(documentsFromApplication(application)).toEqual(documents)
    })

    it('returns an empty array if the application doesnt have selected documents', () => {
      const application = applicationFactory.build()

      expect(documentsFromApplication(application)).toEqual([])
    })
  })

  describe('overwriteApplicationDocuments', () => {
    it('overwrites the current documents on the application with the ones supplied and returns the application', () => {
      const application = applicationFactory.build()
      const originalDocuments = documentFactory.buildList(1)
      const newDocuments = documentFactory.buildList(2)

      application.data['attach-required-documents'] = {
        'attach-documents': {
          selectedDocuments: originalDocuments,
        },
      }

      const applicationWithNewDocuments = overwriteApplicationDocuments(application, newDocuments)

      expect(documentsFromApplication(applicationWithNewDocuments)).toEqual(newDocuments)
    })
  })
})
