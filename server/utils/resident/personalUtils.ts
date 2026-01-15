import { FullPerson, PersonRisks } from '@approved-premises/api'
import { card, ndeliusDeeplink, ResidentProfileSubTab } from './index'
import paths from '../../paths/manage'
import { RenderAs, summaryListItem } from '../formUtils'
import { PersonStatusTag } from '../people/personStatusTag'
import { getTierOrBlank } from '../applications/helpers'

export const personalSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  const basePath = paths.resident.tabPersonal
  return [
    {
      text: 'Personal details',
      href: basePath.personalDetails({ crn, placementId }),
      active: subTab === 'personalDetails',
    },
    { text: 'Contacts', href: basePath.contacts({ crn, placementId }), active: subTab === 'contacts' },
  ]
}

export const personDetailsCardList = (person: FullPerson, personRisks: PersonRisks) => {
  const isNotRestricted = person.type === 'FullPerson'

  const restrictedRow = (label: string, value: string, renderAs?: RenderAs) => {
    if (isNotRestricted) return summaryListItem(label, value, renderAs)
    return summaryListItem(label, 'Restricted')
  }

  const linkToAddresses: string = ndeliusDeeplink({
    crn: person.crn,
    text: 'NDelius address details',
    component: 'AddressandAccommodation',
  })
  const linkToEquality: string = ndeliusDeeplink({
    crn: person.crn,
    text: 'NDelius equality details',
    component: 'EqualityMonitoring',
  })
  const linkToPersonalDetails: string = ndeliusDeeplink({
    crn: person.crn,
    text: 'NDelius personal details',
    component: 'CaseSummary',
  })

  return [
    card({
      title: 'Contact details',
      rows: [
        summaryListItem('Phone number', linkToPersonalDetails, 'html'),
        summaryListItem('Email address', linkToPersonalDetails, 'html'),
        summaryListItem('Main address', linkToAddresses, 'html'),
        summaryListItem('Other addresses', linkToAddresses, 'html'),
      ],
    }),
    card({
      title: 'Personal details',
      rows: [
        restrictedRow('Name', person.name),
        summaryListItem('Aliases', linkToPersonalDetails, 'html'),
        restrictedRow('Date of birth', person.dateOfBirth, 'date'),
        summaryListItem('Status', new PersonStatusTag(person.status).html(), 'html'),
        restrictedRow('Nationality', person.nationality),
        summaryListItem('Immigration status', linkToEquality, 'html'),
        summaryListItem('Languages', linkToEquality, 'html'),
        summaryListItem('Relationship status', linkToEquality, 'html'),
        summaryListItem('Tier', getTierOrBlank(personRisks.tier?.value?.level), 'html'),
      ],
    }),
    card({
      title: 'Identity numbers',
      rows: [restrictedRow('Nomis number', person.nomsNumber), restrictedRow('PNC number', person.pncNumber)],
    }),
    card({
      title: 'Equality and monitoring',
      rows: [
        restrictedRow('Ethnicity', person.ethnicity),
        restrictedRow('Religion or belief', person.religionOrBelief),
        restrictedRow('Sex', person.sex),
        restrictedRow('Gender identity', person.genderIdentity),
        summaryListItem('Sexual orientation', linkToEquality, 'html'),
      ],
    }),
  ]
}

export const contactsCardList = (crn: string) => [
  card({
    title: 'Contact details',
    html: ndeliusDeeplink({ crn, text: 'See contacts in NDelius', component: 'PersonalContacts' }),
  }),
]
