import { FullPerson, PersonRisks } from '@approved-premises/api'
import { card, insetText, ndeliusDeeplink, ResidentProfileSubTab, summaryItemNd } from './index'
import paths from '../../paths/manage'
import { summaryListItem } from '../formUtils'
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
        summaryItemNd('Name', person.name),
        summaryListItem('Aliases', linkToPersonalDetails, 'html'),
        summaryItemNd('Date of birth', person.dateOfBirth, 'date'),
        summaryItemNd('Status', person.status && new PersonStatusTag(person.status).html(), 'html'),
        summaryItemNd('Nationality', person.nationality),
        summaryListItem('Immigration status', linkToEquality, 'html'),
        summaryListItem('Languages', linkToEquality, 'html'),
        summaryListItem('Relationship status', linkToEquality, 'html'),
        summaryItemNd('Tier', getTierOrBlank(personRisks.tier?.value?.level), 'html'),
      ],
    }),
    card({
      title: 'Identity numbers',
      rows: [summaryItemNd('Nomis number', person.nomsNumber), summaryItemNd('PNC number', person.pncNumber)],
    }),
    card({
      title: 'Equality and monitoring',
      rows: [
        summaryItemNd('Ethnicity', person.ethnicity),
        summaryItemNd('Religion or belief', person.religionOrBelief),
        summaryItemNd('Sex', person.sex),
        summaryItemNd('Gender identity', person.genderIdentity),
        summaryListItem('Sexual orientation', linkToEquality, 'html'),
      ],
    }),
  ]
}

export const contactsCardList = (crn: string) => [
  card({
    html: insetText(`<p>We cannot display personal contacts from NDelius yet. For example, probation practitioner contact details.</p>
${ndeliusDeeplink({ crn, text: 'View personal contacts in NDelius (opens in a new tab).', component: 'PersonalContacts' })}
`),
  }),
]
