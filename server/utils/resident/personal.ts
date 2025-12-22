import { Cas1SpaceBooking, FullPerson, Person, PersonRisks } from '@approved-premises/api'
import { card, ResidentProfileSubTab, TabControllerParameters, TabData } from './index'
import { RenderAs, summaryListItem } from '../formUtils'
import { getTierOrBlank } from '../applications/helpers'
import paths from '../../paths/manage'
import { linkTo } from '../utils'
import { PersonStatusTag } from '../people/personStatusTag'

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

export const personDetailsCardList = (person: FullPerson, personRisks: PersonRisks, placement: Cas1SpaceBooking) => {
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
        summaryListItem(
          'Prison',
          `<p>${isNotRestricted ? (person.prisonName ?? 'Not known') : 'Restricted'}</p>${linkTo(paths.resident.tabSentence.prison({ crn: person.crn, placementId: placement.id }), { text: 'View all prison information' })}`,
          'html',
        ),
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

export const personalDetailsTabController = async ({
  personService,
  token,
  crn,
  personRisks,
  placement,
}: TabControllerParameters): Promise<TabData> => {
  const [person]: [Person] = await Promise.all([personService.findByCrn(token, crn)])

  return {
    subHeading: 'Personal details',
    cardList: personDetailsCardList(person as FullPerson, personRisks, placement),
  }
}
