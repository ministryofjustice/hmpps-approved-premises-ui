import {
  cas1ApplicationSummaryFactory,
  personFactory,
  restrictedPersonFactory,
  tierEnvelopeFactory,
} from '../../testutils/factories'
import { createNameAnchorElement, getTierOrBlank, personKeyDetails } from './helpers'
import paths from '../../paths/apply'
import * as personUtils from '../personUtils'
import { fullPersonFactory, unknownPersonFactory } from '../../testutils/factories/person'
import { displayName } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { htmlCell, textCell } from '../tableUtils'

describe('helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('createNameAnchorElement', () => {
    describe('when the user can view the Full Person', () => {
      const person = personFactory.build()

      it("returns a link to an application with the person's name", () => {
        const applicationSummary = cas1ApplicationSummaryFactory.build()

        expect(createNameAnchorElement(person, applicationSummary)).toEqual(
          htmlCell(
            `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${displayName(
              person,
            )}</a>`,
          ),
        )
      })

      describe('when the application status is started', () => {
        const applicationSummary = cas1ApplicationSummaryFactory.build({ status: 'started' })

        it('returns name copy only when an application is in progress and linkInProgressApplications is false', () => {
          expect(createNameAnchorElement(person, applicationSummary, { linkInProgressApplications: false })).toEqual(
            textCell(displayName(person)),
          )
        })

        it('returns a link to the application by default when the application is in progress', () => {
          expect(createNameAnchorElement(person, applicationSummary)).toEqual(
            htmlCell(
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
      const applicationSummary = cas1ApplicationSummaryFactory.build()

      it('returns "Limited Access Offender" with no link', () => {
        expect(createNameAnchorElement(person, applicationSummary)).toEqual(textCell(`Limited Access Offender`))
      })

      it('returns "LAO: crn" with no link when crn is requested', () => {
        expect(createNameAnchorElement(person, applicationSummary, { showCrn: true })).toEqual(
          textCell(`LAO: ${person.crn}`),
        )
      })
    })

    describe('when the user views an Unknown Person', () => {
      const person = unknownPersonFactory.build()
      const applicationSummary = cas1ApplicationSummaryFactory.build()

      it('returns "Unknown person" with no link', () => {
        expect(createNameAnchorElement(person, applicationSummary)).toEqual(textCell(`Unknown person`))
      })

      it('returns "Unknown: crn" with no link when crn is requested', () => {
        expect(createNameAnchorElement(person, applicationSummary, { showCrn: true })).toEqual(
          textCell(`Unknown: ${person.crn}`),
        )
      })
    })
  })

  describe('textCell', () => {
    it('should return a text value for nunjucks helpers', () => {
      expect(textCell('foo')).toEqual({ text: 'foo' })
    })
  })

  describe('htmlCell', () => {
    it('should return a htmls value for nunjucks helpers', () => {
      expect(htmlCell('foo')).toEqual({ html: 'foo' })
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
  describe('personKeyDetails', () => {
    const tier = tierEnvelopeFactory.build().value.level

    it('should return the key information for a placement', () => {
      const person = personFactory.build()

      expect(personKeyDetails(person, tier)).toEqual({
        header: { key: '', showKey: false, value: person.name },
        items: [
          { key: { text: 'CRN' }, value: { text: person.crn } },
          { key: { text: 'Tier' }, value: { text: tier } },
          {
            key: { text: 'Date of birth' },
            value: {
              text: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            },
          },
        ],
      })
    })

    it('should show the tier as not available if it is not defined', () => {
      const person = personFactory.build()

      const result = personKeyDetails(person)

      expect(result.items[1].value).toEqual({ text: 'Not available' })
    })

    it('should prefix the name with LAO if the person is LAO', () => {
      const person = fullPersonFactory.build({
        isRestricted: true,
      })

      const result = personKeyDetails(person, tier)

      expect(result.header.value).toEqual(`LAO: ${person.name}`)
    })

    it('should not show the name or date of birth for a restricted person', () => {
      const person = restrictedPersonFactory.build()

      expect(personKeyDetails(person, tier)).toEqual({
        header: { key: '', showKey: false, value: 'Limited Access Offender' },
        items: [
          { key: { text: 'CRN' }, value: { text: person.crn } },
          { key: { text: 'Tier' }, value: { text: tier } },
        ],
      })
    })

    it('should not show the name or date of birth for an unknown person', () => {
      const person = unknownPersonFactory.build()

      expect(personKeyDetails(person, tier)).toEqual({
        header: { key: '', showKey: false, value: 'Unknown person' },
        items: [
          { key: { text: 'CRN' }, value: { text: person.crn } },
          { key: { text: 'Tier' }, value: { text: tier } },
        ],
      })
    })
  })
})
