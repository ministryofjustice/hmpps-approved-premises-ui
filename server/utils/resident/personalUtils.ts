import { FullPerson, PersonRisks } from '@approved-premises/api'
import { card, insetText, ndeliusDeeplink, ResidentProfileSubTab, summaryItemNd } from './index'
import paths from '../../paths/manage'
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
  return [
    card({
      title: 'Contact details',
      html: ndeliusDeeplink({
        crn: person.crn,
        text: 'View contact details in NDelius (opens in a new window)',
        component: 'CaseSummary',
      }),
    }),
    card({
      title: 'Personal details',
      rows: [
        summaryItemNd('Name', person.name),
        summaryItemNd('Date of birth', person.dateOfBirth, 'date'),
        summaryItemNd('Status', person.status && new PersonStatusTag(person.status).html(), 'html'),
        summaryItemNd('Nationality', person.nationality),
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
