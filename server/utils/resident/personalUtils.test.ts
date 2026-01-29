import { SummaryListWithCard } from '@approved-premises/ui'
import { FullPerson } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { personalSideNavigation, personDetailsCardList } from './personalUtils'
import { cas1SpaceBookingFactory, risksFactory } from '../../testutils/factories'
import { fullPersonFactory } from '../../testutils/factories/person'
import { DateFormats } from '../dateUtils'
import { PersonStatusTag } from '../people/personStatusTag'
import { getTierOrBlank } from '../applications/helpers'
import * as utils from './index'
import { htmlCell } from '../tableUtils'

describe('personalUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

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
      expect(card).toEqual({
        card: { title: { text: 'Identity numbers' } },
        rows: [
          { key: { text: 'Nomis number' }, value: { text: person.nomsNumber } },
          { key: { text: 'PNC number' }, value: { text: person.pncNumber } },
        ],
      })
    }

    const validateEqualityCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      expect(card).toEqual({
        card: { title: { text: 'Equality and monitoring' } },
        rows: [
          { key: { text: 'Ethnicity' }, value: { text: person.ethnicity } },
          { key: { text: 'Religion or belief' }, value: { text: person.religionOrBelief } },
          { key: { text: 'Sex' }, value: { text: person.sex } },
          { key: { text: 'Gender identity' }, value: { text: person.genderIdentity } },
          { key: { text: 'Sexual orientation' }, value: equalityLink },
        ],
      })
    }

    const validatePersonalCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      expect(card).toEqual({
        card: { title: { text: 'Personal details' } },
        rows: [
          { key: { text: 'Name' }, value: { text: person.name } },
          { key: { text: 'Aliases' }, value: personaDetailsLink },
          {
            key: { text: 'Date of birth' },
            value: {
              text: person.dateOfBirth && DateFormats.isoDateToUIDate(person.dateOfBirth),
            },
          },
          { key: { text: 'Status' }, value: { html: new PersonStatusTag(person.status).html() } },
          { key: { text: 'Nationality' }, value: { text: person.nationality } },
          { key: { text: 'Immigration status' }, value: equalityLink },
          { key: { text: 'Languages' }, value: equalityLink },
          { key: { text: 'Relationship status' }, value: equalityLink },
          { key: { text: 'Tier' }, value: { html: getTierOrBlank(personRisks.tier?.value?.level) } },
        ],
      })
    }

    const person = fullPersonFactory.build({
      ethnicity: faker.helpers.arrayElement(['White', 'Black', 'Asian', 'Mixed']),
      genderIdentity: faker.helpers.arrayElement(['Man', 'Woman']),
    })
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
  })
})
