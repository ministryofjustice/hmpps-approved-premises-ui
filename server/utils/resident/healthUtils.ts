import { Cas1OASysGroup, PersonAcctAlert } from '@approved-premises/api'
import { card, insetText, ResidentProfileSubTab } from '.'
import paths from '../../paths/manage'
import { dateCellNoWrap, textCell } from '../tableUtils'
import { summaryCards, tableRow } from './riskUtils'

export const healthSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placementId: string) => {
  const basePath = paths.resident.tabHealth
  return [
    {
      text: 'Health and disability',
      href: basePath.healthDetails({ crn, placementId }),
      active: subTab === 'healthDetails',
    },
    {
      text: 'Mental health',
      href: basePath.mentalHealth({ crn, placementId }),
      active: subTab === 'mentalHealth',
    },
    {
      text: 'Drug and alcohol use',
      href: basePath.drugsAndAlcohol({ crn, placementId }),
      active: subTab === 'drugAndAlcohol',
    },
  ]
}

export const healthDetailsCards = (supportingInformation: Cas1OASysGroup) => [
  card({ html: insetText('Imported from OASys') }),
  ...summaryCards(['13.1'], supportingInformation),
]

export const mentalHealthCards = (personAcctAlerts: Array<PersonAcctAlert>, riskToSelf: Cas1OASysGroup) => [
  card({ html: insetText('Imported from Digital Prison Service and OASys') }),
  ...summaryCards(['FA62', 'FA63', 'FA64', 'R8.1.1', 'R8.2.1', 'R8.3.1'], riskToSelf),
  card({
    title: 'ACCT alerts',
    topHtml: tableRow('Imported from Digital Prison Service'),
    table: personAcctAlerts?.length && {
      head: [textCell('Date created'), textCell('Description'), textCell('Expiry date')],
      rows: personAcctAlerts.map((acctAlert: PersonAcctAlert) => [
        dateCellNoWrap(acctAlert.dateCreated),
        textCell(acctAlert.description),
        dateCellNoWrap(acctAlert.dateExpires),
      ]),
    },
    html: !personAcctAlerts?.length ? '<p>No ACCT alerts found</p>' : undefined,
  }),
]

export const drugAndAlcoholCards = (supportingInformation: Cas1OASysGroup) => [
  card({ html: insetText('Imported from OASys') }),
  ...summaryCards(['8.9', '9.9'], supportingInformation),
]
