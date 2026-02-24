import { BookingDetails, Cas1OASysGroup, PersonAcctAlert } from '@approved-premises/api'
import { card, insetText, loadingErrorMessage, ResidentProfileSubTab } from '.'
import paths from '../../paths/manage'
import { dateCellNoWrap, textCell } from '../tableUtils'
import { oasysQuestionDetailsByNumber, summaryCards, tableRow } from './riskUtils'
import { ApiOutcome } from '../utils'
import { summaryListItem } from '../formUtils'

export const smokingStatusMapping: Record<string, string> = {
  SMOKER_YES: 'Smoker',
  SMOKER_NO: 'Non-smoker',
  SMOKER_VAPER: 'Vaper',
}

export const getSmokingStatus = (bookingDetails: BookingDetails | null): string | null => {
  const smokingInfo = bookingDetails?.profileInformation?.find(info => info.type === 'SMOKE')
  const value = smokingInfo?.resultValue
  return value ? smokingStatusMapping[value] || value : null
}

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
  ]
}

export const healthDetailsCards = (
  supportingInformation: Cas1OASysGroup,
  outcome: ApiOutcome,
  bookingDetails: BookingDetails | null = null,
  bookingDetailsOutcome?: ApiOutcome,
) => {
  let cards = [card({ html: insetText('Imported from OASys') })]

  const assessentIso = supportingInformation?.assessmentMetadata?.dateCompleted
  if (assessentIso && assessentIso > '2025-04-09T18:00') {
    const definition = oasysQuestionDetailsByNumber['13.1']
    cards = cards.concat(
      card({
        title: definition.label,
        html: `<p>We cannot load general health - any physical or mental health conditions right now.</p>
<p>Go to OASys to check if any general health details have been entered.</p>`,
      }),
    )
  } else {
    cards = cards.concat(summaryCards(['13.1'], supportingInformation, outcome))
  }

  const source = 'Digital Prison Service (DPS)'
  const smokingStatus = getSmokingStatus(bookingDetails)
  const smokingError = loadingErrorMessage({ result: bookingDetailsOutcome, item: 'smoking status', source })

  cards = cards.concat(
    card({
      title: 'Smoker or vaper',
      rows: smokingStatus ? [summaryListItem('Smoker or vaper', smokingStatus)] : undefined,
      html: !smokingStatus ? smokingError || `<p class="govuk-hint">Not entered in ${source}</p>` : undefined,
    }),
  )

  return cards
}

export const mentalHealthCards = ({
  personAcctAlerts,
  personAcctAlertsOutcome,
  riskToSelf,
  riskToSelfOutcome,
  supportingInformation,
  supportingInformationOutcome,
}: {
  personAcctAlerts: Array<PersonAcctAlert>
  personAcctAlertsOutcome: ApiOutcome
  riskToSelf: Cas1OASysGroup
  riskToSelfOutcome: ApiOutcome
  supportingInformation: Cas1OASysGroup
  supportingInformationOutcome: ApiOutcome
}) => [
  card({ html: insetText('Imported from Digital Prison Service and OASys') }),
  ...summaryCards(['FA62', 'FA63', 'FA64', 'R8.1.1', 'R8.2.1', 'R8.3.1'], riskToSelf, riskToSelfOutcome),
  ...summaryCards(['10.9'], supportingInformation, supportingInformationOutcome),
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
    html: !personAcctAlerts?.length
      ? loadingErrorMessage({ result: personAcctAlertsOutcome, item: 'ACCT alerts', source: 'Digital Prison Service' })
      : undefined,
  }),
]
