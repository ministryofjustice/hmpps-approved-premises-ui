import { FullPerson, PersonRisks } from '@approved-premises/api'
import { card, ResidentProfileSubTab } from './index'
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

  return [
    card({
      title: 'Contact details',
      rows: [
        summaryListItem('Phone number', 'TBA'),
        summaryListItem('Email address', 'TBA'),
        summaryListItem('Main address', 'TBA'),
        summaryListItem('Other addresses', 'TBA'),
      ],
    }),
    card({
      title: 'Personal details',
      rows: [
        restrictedRow('Name', person.name),
        summaryListItem('Aliases', 'TBA'),
        restrictedRow('Date of birth', person.dateOfBirth, 'date'),
        summaryListItem('Status', new PersonStatusTag(person.status).html(), 'html'),
        restrictedRow('Nationality', person.nationality),
        summaryListItem('Immigration status', 'TBA'),
        summaryListItem('Languages', 'TBA'),
        summaryListItem('Relationship status', 'TBA'),
        summaryListItem('Dependants', 'TBA'),
        summaryListItem('Disabilities', 'TBA'),
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
        summaryListItem('Sexual orientation', 'TBA'),
      ],
    }),
  ]
}
