import { createMock } from '@golevelup/ts-jest'
import { FullPerson } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { cas1SpaceBookingFactory, risksFactory } from '../../testutils/factories'
import { personalDetailsTabController, personalSideNavigation } from './personal'
import { PersonService } from '../../services'
import { DateFormats } from '../dateUtils'
import { getTierOrBlank } from '../applications/helpers'
import { PersonStatusTag } from '../people/personStatusTag'

const personService = createMock<PersonService>({})
const token = 'token'
const placement = cas1SpaceBookingFactory.build()
const personRisks = risksFactory.build()
const { crn } = placement.person

describe('Personal tab utils', () => {
  const restrict = (value: SummaryListItem['value'], restricted = false): SummaryListItem['value'] => {
    return restricted ? { text: 'Restricted' } : value
  }
  describe('personalSideNavigation', () => {
    it('should return the side navigation for the personal tab', () => {
      const basePath = `/manage/resident/${crn}/placement/${placement.id}/personal/`
      expect(personalSideNavigation('personalDetails', crn, placement.id)).toEqual([
        {
          active: true,
          href: `${basePath}personalDetails`,
          text: 'Personal details',
        },
        {
          active: false,
          href: `${basePath}contacts`,
          text: 'Contacts',
        },
      ])
    })
  })

  describe('personalDetailsTabController', () => {
    const validateNumbersCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      const isRestricted = person.type !== 'FullPerson'

      expect(card).toEqual({
        card: { title: { text: 'Identity numbers' } },
        rows: [
          { key: { text: 'Nomis number' }, value: restrict({ text: person.nomsNumber }, isRestricted) },
          { key: { text: 'PNC number' }, value: restrict({ text: person.pncNumber }, isRestricted) },
        ],
      })
    }

    const validateEqualityCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      const isRestricted = person.type !== 'FullPerson'

      expect(card).toEqual({
        card: { title: { text: 'Equality and monitoring' } },
        rows: [
          { key: { text: 'Ethnicity' }, value: restrict({ text: person.ethnicity }, isRestricted) },
          { key: { text: 'Religion or belief' }, value: restrict({ text: person.religionOrBelief }, isRestricted) },
          { key: { text: 'Sex' }, value: restrict({ text: person.sex }, isRestricted) },
          { key: { text: 'Gender identity' }, value: restrict({ text: person.genderIdentity }, isRestricted) },
          { key: { text: 'Sexual orientation' }, value: { text: 'TBA' } },
        ],
      })
    }

    const validatePersonalCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      const isRestricted = person.type !== 'FullPerson'
      expect(card).toEqual({
        card: { title: { text: 'Personal details' } },
        rows: [
          { key: { text: 'Name' }, value: restrict({ text: person.name }, isRestricted) },
          { key: { text: 'Aliases' }, value: { text: 'TBA' } },
          {
            key: { text: 'Date of birth' },
            value: restrict(
              {
                text: DateFormats.isoDateToUIDate(person.dateOfBirth),
              },
              isRestricted,
            ),
          },
          { key: { text: 'Status' }, value: { html: new PersonStatusTag(person.status).html() } },
          {
            key: { text: 'Prison' },
            value: {
              html: `<p>${isRestricted ? 'Restricted' : person.prisonName}</p><a href="/manage/resident/${crn}/placement/${placement.id}/sentence/prison">View all prison information</a>`,
            },
          },
          { key: { text: 'Nationality' }, value: restrict({ text: person.nationality }, isRestricted) },
          { key: { text: 'Immigration status' }, value: { text: 'TBA' } },
          { key: { text: 'Languages' }, value: { text: 'TBA' } },
          { key: { text: 'Relationship status' }, value: { text: 'TBA' } },
          { key: { text: 'Dependants' }, value: { text: 'TBA' } },
          { key: { text: 'Disabilities' }, value: { text: 'TBA' } },
          { key: { text: 'Tier' }, value: { html: getTierOrBlank(personRisks.tier?.value?.level) } },
        ],
      })
    }

    it('should render the personal details tab content for a full person', async () => {
      personService.findByCrn.mockResolvedValue(placement.person)
      const person = placement.person as FullPerson

      const result = await personalDetailsTabController({
        personService,
        token,
        crn,
        personRisks,
        placement,
      })
      expect(result).toEqual(expect.objectContaining({ subHeading: 'Personal details' }))

      expect(result.cardList[0]).toEqual({
        card: { title: { text: 'Contact details' } },
        rows: [
          { key: { text: 'Phone number' }, value: { text: 'TBA' } },
          { key: { text: 'Email address' }, value: { text: 'TBA' } },
          { key: { text: 'Main address' }, value: { text: 'TBA' } },
          { key: { text: 'Other addresses' }, value: { text: 'TBA' } },
        ],
      })

      validatePersonalCard(result.cardList[1], person)
      validateNumbersCard(result.cardList[2], person)
      validateEqualityCard(result.cardList[3], person)
    })

    it('should render the personal details for a restricted person', async () => {
      personService.findByCrn.mockResolvedValue({ ...placement.person, type: 'RestrictedPerson' })

      const result = await personalDetailsTabController({
        personService,
        token,
        crn,
        personRisks,
        placement,
      })

      const restrictedPerson = { ...placement.person, type: 'RestrictedPerson' } as FullPerson

      validatePersonalCard(result.cardList[1], restrictedPerson)
      validateNumbersCard(result.cardList[2], restrictedPerson)
      validateEqualityCard(result.cardList[3], restrictedPerson)
    })
  })
})
