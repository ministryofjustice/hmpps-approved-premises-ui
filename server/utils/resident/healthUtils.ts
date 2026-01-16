import { PersonAcctAlert } from '@approved-premises/api'
import { card, insetText, ResidentProfileSubTab } from '.'
import paths from '../../paths/manage'
import { textCell } from '../tableUtils'

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

export const mentalHealthCards = (personAcctAlerts: Array<PersonAcctAlert>) => {
  return [
    card({ html: insetText('Imported from DPS, NDelius and OASys') }),
    card({
      title: 'ACCT alerts',
      table: personAcctAlerts?.length && {
        head: [
          textCell('Date created'),
          textCell('Description'),
          textCell('Expiry date'),
          textCell('Alert type'),
          textCell('Comment'),
        ],
        rows: personAcctAlerts.map((acctAlert: PersonAcctAlert) => [
          textCell(acctAlert.dateCreated),
          textCell(acctAlert.description),
          textCell(acctAlert.dateExpires),
          textCell(acctAlert.alertTypeDescription),
          textCell(acctAlert.comment),
        ]),
      },
      html: !personAcctAlerts?.length ? 'No ACCT alerts found' : undefined,
    }),
  ]
}
