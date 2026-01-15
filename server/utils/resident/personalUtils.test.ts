import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { FullPerson } from '@approved-premises/api'
import { personalSideNavigation, personDetailsCardList } from './personalUtils'
import { cas1SpaceBookingFactory, restrictedPersonFactory, risksFactory } from '../../testutils/factories'
import { fullPersonFactory } from '../../testutils/factories/person'
import { DateFormats } from '../dateUtils'
import { PersonStatusTag } from '../people/personStatusTag'
import { getTierOrBlank } from '../applications/helpers'
import * as utils from './index'
import { htmlCell } from '../tableUtils'

describe('personalUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

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

  describe('personDetailsCardList', () => {
    const personaDetailsLink = htmlCell('CaseSummary:NDelius personal details')
    const addressLink = htmlCell('AddressandAccommodation:NDelius address details')
    const equalityLink = htmlCell('EqualityMonitoring:NDelius equality details')

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
          { key: { text: 'Sexual orientation' }, value: equalityLink },
        ],
      })
    }

    const validatePersonalCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      const isRestricted = person.type !== 'FullPerson'
      expect(card).toEqual({
        card: { title: { text: 'Personal details' } },
        rows: [
          { key: { text: 'Name' }, value: restrict({ text: person.name }, isRestricted) },
          { key: { text: 'Aliases' }, value: personaDetailsLink },
          {
            key: { text: 'Date of birth' },
            value: restrict(
              {
                text: person.dateOfBirth && DateFormats.isoDateToUIDate(person.dateOfBirth),
              },
              isRestricted,
            ),
          },
          { key: { text: 'Status' }, value: { html: new PersonStatusTag(person.status).html() } },
          { key: { text: 'Nationality' }, value: restrict({ text: person.nationality }, isRestricted) },
          { key: { text: 'Immigration status' }, value: equalityLink },
          { key: { text: 'Languages' }, value: equalityLink },
          { key: { text: 'Relationship status' }, value: equalityLink },
          { key: { text: 'Tier' }, value: { html: getTierOrBlank(personRisks.tier?.value?.level) } },
        ],
      })
    }

    const person = fullPersonFactory.build()
    const personRisks = risksFactory.build()

    beforeEach(() => {
      jest.spyOn(utils, 'ndeliusDeeplink').mockImplementation(({ text, component }) => `${component}:${text}`)
    })

    it('should render the personal details cardlist', () => {
      const result = personDetailsCardList(person, personRisks)

      expect(result[0]).toEqual({
        card: { title: { text: 'Contact details' } },
        rows: [
          { key: { text: 'Phone number' }, value: personaDetailsLink },
          { key: { text: 'Email address' }, value: personaDetailsLink },
          { key: { text: 'Main address' }, value: addressLink },
          { key: { text: 'Other addresses' }, value: addressLink },
        ],
      })
      validatePersonalCard(result[1], person)
      validateNumbersCard(result[2], person)
      validateEqualityCard(result[3], person)
    })

    it('should render the personal details for a restricted person', async () => {
      const restrictedPerson = restrictedPersonFactory.build()

      const result = personDetailsCardList(restrictedPerson as FullPerson, personRisks)

      validatePersonalCard(result[1], restrictedPerson)
      validateNumbersCard(result[2], restrictedPerson)
      validateEqualityCard(result[3], restrictedPerson)
    })
  })
})
