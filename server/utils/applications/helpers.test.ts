import { applicationSummaryFactory, personFactory, restrictedPersonFactory } from '../../testutils/factories'
import { createNameAnchorElement, getTierOrBlank, htmlValue, textValue } from './helpers'
import paths from '../../paths/apply'
import * as personUtils from '../personUtils'
import { unknownPersonFactory } from '../../testutils/factories/person'
import { displayName } from '../personUtils'

describe('helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('createNameAnchorElement', () => {
    describe('when the user can view the Full Person', () => {
      const person = personFactory.build()

      it("returns a link to an application with the person's name", () => {
        const applicationSummary = applicationSummaryFactory.build()

        expect(createNameAnchorElement(person, applicationSummary)).toEqual(
          htmlValue(
            `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${displayName(
              person,
            )}</a>`,
          ),
        )
      })

      describe('when the application status is started', () => {
        const applicationSummary = applicationSummaryFactory.build({ status: 'started' })

        it('returns name copy only when an application is in progress and linkInProgressApplications is false', () => {
          expect(createNameAnchorElement(person, applicationSummary, { linkInProgressApplications: false })).toEqual(
            textValue(displayName(person)),
          )
        })

        it('returns a link to the application by default when the application is in progress', () => {
          expect(createNameAnchorElement(person, applicationSummary)).toEqual(
            htmlValue(
              `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${displayName(
                person,
              )}</a>`,
            ),
          )
        })
      })
    })

    describe('when the user views a Restricted Person', () => {
      const person = restrictedPersonFactory.build()
      const applicationSummary = applicationSummaryFactory.build()

      it('returns "Limited Access Offender" with no link', () => {
        expect(createNameAnchorElement(person, applicationSummary)).toEqual(textValue(`Limited Access Offender`))
      })

      it('returns "LAO: crn" with no link when crn is requested', () => {
        expect(createNameAnchorElement(person, applicationSummary, { showCrn: true })).toEqual(
          textValue(`LAO: ${person.crn}`),
        )
      })
    })

    describe('when the user views an Unknown Person', () => {
      const person = unknownPersonFactory.build()
      const applicationSummary = applicationSummaryFactory.build()

      it('returns "Unknown person" with no link', () => {
        expect(createNameAnchorElement(person, applicationSummary)).toEqual(textValue(`Unknown person`))
      })

      it('returns "Unknown: crn" with no link when crn is requested', () => {
        expect(createNameAnchorElement(person, applicationSummary, { showCrn: true })).toEqual(
          textValue(`Unknown: ${person.crn}`),
        )
      })
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
    beforeEach(() => {
      jest.spyOn(personUtils, 'tierBadge')
    })

    it('should return the tier when present', () => {
      expect(getTierOrBlank('foo')).toEqual(personUtils.tierBadge('foo'))
      expect(personUtils.tierBadge).toHaveBeenCalledWith('foo')
    })

    it('should return an empty string when undefined', () => {
      expect(getTierOrBlank(undefined)).toEqual('')
      expect(personUtils.tierBadge).not.toHaveBeenCalled()
    })

    it('should return an empty string when null', () => {
      expect(getTierOrBlank(null)).toEqual('')
      expect(personUtils.tierBadge).not.toHaveBeenCalled()
    })
  })
})
