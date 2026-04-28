import { SummaryListWithCard } from '@approved-premises/ui'
import { FullPerson } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { contactsCardList, personalSideNavigation, personDetailsCardList } from './personalUtils'
import { cas1SpaceBookingFactory, caseDetailFactory, risksFactory } from '../../testutils/factories'
import { fullPersonFactory } from '../../testutils/factories/person'
import { DateFormats } from '../dateUtils'
import { PersonStatusTag } from '../people/personStatusTag'
import { getTierOrBlank } from '../applications/helpers'
import * as utils from './index'
import * as contactUtils from './contactUtils'
import { htmlCell } from '../tableUtils'

describe('personalUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

  afterEach(() => {
    jest.restoreAllMocks()
  })

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
        ],
      })
    }

    const validatePersonalCard = (card: SummaryListWithCard, person: Partial<FullPerson>) => {
      expect(card).toEqual({
        card: { title: { text: 'Personal details' } },
        rows: [
          { key: { text: 'Name' }, value: { text: person.name } },
          {
            key: { text: 'Date of birth' },
            value: {
              text: person.dateOfBirth && DateFormats.isoDateToUIDate(person.dateOfBirth),
            },
          },
          { key: { text: 'Status' }, value: { html: new PersonStatusTag(person.status).html() } },
          { key: { text: 'Nationality' }, value: { text: person.nationality } },
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
        html: 'CaseSummary:View contact details in NDelius (opens in a new window)',
      })
      validatePersonalCard(result[1], person)
      validateNumbersCard(result[2], person)
      validateEqualityCard(result[3], person)
    })
  })

  describe('contactsCardList', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'insetText').mockImplementation(text => `inset("${text}")`)
      jest.spyOn(utils, 'ndeliusDeeplink').mockImplementation(({ text, component }) => `${component}:${text}`)
      jest.spyOn(contactUtils, 'contactCard')
      jest.spyOn(contactUtils, 'groupContacts').mockReturnValue({ PROF: [], PERS: [], OTH: [] })
    })

    const caseDetail = caseDetailFactory.build()
    const nDeliusLink = 'PersonalContacts:View contact information in NDelius (opens in a new tab).'

    it('should render the personal contacts cards', () => {
      const result = contactsCardList(caseDetail, 'success', 'crn')

      expect(result).toEqual([
        {
          html: `inset("<p>Imported from NDelius</p>${nDeliusLink}")`,
        },
        expect.objectContaining(utils.card({ title: 'Professional contacts' })),
        expect.objectContaining(utils.card({ title: 'Personal contacts' })),
        expect.objectContaining(utils.card({ title: 'Other contacts' })),
      ])
      expect(contactUtils.contactCard).toHaveBeenCalledWith('Professional contacts', [])
      expect(contactUtils.contactCard).toHaveBeenCalledWith('Personal contacts', [])
      expect(contactUtils.contactCard).toHaveBeenCalledWith('Other contacts', [])
      expect(contactUtils.groupContacts).toHaveBeenCalledWith(caseDetail.personalContacts)
    })

    it('should render on a caseDetails failure', () => {
      expect(contactsCardList(caseDetail, 'failure', 'crn')).toEqual([
        htmlCell(
          `inset("<p>We cannot load contacts information right now because NDelius is not available.<br>Try again later</p>${nDeliusLink}")`,
        ),
      ])
    })
  })
})
