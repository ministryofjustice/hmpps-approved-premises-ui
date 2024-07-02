import { when } from 'jest-when'
import { applicationSummaryFactory, personFactory } from '../../testutils/factories'
import { createNameAnchorElement, getTierOrBlank, htmlValue, textValue } from './helpers'
import paths from '../../paths/apply'
import { isFullPerson, isUnknownPerson, nameOrPlaceholderCopy, tierBadge } from '../personUtils'

jest.mock('../personUtils')

describe('helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('createNameAnchorElement', () => {
    it('returns a link to an application with a full person', () => {
      const applicationSummary = applicationSummaryFactory.build()
      const person = personFactory.build()

      when(isFullPerson).calledWith(person).mockReturnValue(true)

      expect(createNameAnchorElement(person, applicationSummary)).toEqual(
        htmlValue(
          `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${
            person.name
          }</a>`,
        ),
      )
    })

    it('returns an LAO placeholder for an LAO offender', () => {
      const applicationSummary = applicationSummaryFactory.build()
      const person = personFactory.build()

      when(isFullPerson).calledWith(person).mockReturnValue(false)

      expect(createNameAnchorElement(person, applicationSummary)).toEqual(textValue(`LAO CRN: ${person.crn}`))
    })

    it('returns an LAO Not Found for person type Unknown', () => {
      const applicationSummary = applicationSummaryFactory.build()
      const person = personFactory.build()

      when(isFullPerson).calledWith(person).mockReturnValue(false)
      when(isUnknownPerson).calledWith(person).mockReturnValue(false)

      expect(createNameAnchorElement(person, applicationSummary)).toEqual(textValue(`LAO CRN: ${person.crn}`))
    })

    it('returns nameOrPlaceholder copy when an application is in progress and linkInProgressApplications is false', () => {
      const applicationSummary = applicationSummaryFactory.build({ status: 'started' })
      const person = personFactory.build()

      expect(createNameAnchorElement(person, applicationSummary, { linkInProgressApplications: false })).toEqual(
        textValue(nameOrPlaceholderCopy(person, `LAO: ${person.crn}`)),
      )

      expect(nameOrPlaceholderCopy).toHaveBeenCalledWith(person, `LAO: ${person.crn}`)
    })

    it('returns a link to the application by default when the application is in progress', () => {
      const applicationSummary = applicationSummaryFactory.build({ status: 'started' })
      const person = personFactory.build()

      when(isFullPerson).calledWith(person).mockReturnValue(true)

      expect(createNameAnchorElement(person, applicationSummary)).toEqual(
        htmlValue(
          `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${
            person.name
          }</a>`,
        ),
      )
    })
  })

  describe('textValue', () => {
    it('should return a text value for nunjucks helpers', () => {
      expect(textValue('foo')).toEqual({ text: 'foo' })
    })
  })

  describe('htmlValue', () => {
    it('should return a htmls value for nunjucks helpers', () => {
      expect(htmlValue('foo')).toEqual({ html: 'foo' })
    })
  })

  describe('getTierOrBlank', () => {
    it('should return the tier when present', () => {
      expect(getTierOrBlank('foo')).toEqual(tierBadge('foo'))
      expect(tierBadge).toHaveBeenCalledWith('foo')
    })

    it('should return an empty string when undefined', () => {
      expect(getTierOrBlank(undefined)).toEqual('')
      expect(tierBadge).not.toHaveBeenCalled()
    })

    it('should return an empty string when null', () => {
      expect(getTierOrBlank(null)).toEqual('')
      expect(tierBadge).not.toHaveBeenCalled()
    })
  })
})
