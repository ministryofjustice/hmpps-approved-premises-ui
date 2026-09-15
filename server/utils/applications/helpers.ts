import { KeyDetailsArgs } from '@approved-premises/ui'
import { Cas1Application, Cas1ApplicationSummary, RiskTier } from '../../@types/shared'
import { displayName, getVersionedTierValue, isFullPerson, PersonAny } from '../personUtils'
import paths from '../../paths/apply'
import { DateFormats } from '../dateUtils'
import { htmlCell, textCell } from '../tableUtils'
import { summaryListItem } from '../formUtils'

export const createNameAnchorElement = (
  person: PersonAny,
  applicationSummary: Cas1ApplicationSummary,
  {
    linkInProgressApplications,
    showCrn,
  }: {
    linkInProgressApplications?: boolean
    showCrn?: boolean
  } = { linkInProgressApplications: true, showCrn: false },
) => {
  const name = displayName(person, { showCrn })

  if (!linkInProgressApplications && applicationSummary.status === 'started') {
    return textCell(name)
  }

  return isFullPerson(person)
    ? htmlCell(
        `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${
          name
        }</a>`,
      )
    : textCell(name)
}

export const personKeyDetails = (person: PersonAny, tierOnApplicationCreation?: RiskTier): KeyDetailsArgs => ({
  header: { value: displayName(person), key: '', showKey: false },
  items: [
    summaryListItem('CRN', person.crn),
    summaryListItem('Tier', getVersionedTierValue(person, tierOnApplicationCreation) || 'Not available'),
    isFullPerson(person)
      ? summaryListItem('Date of birth', DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }))
      : undefined,
  ],
})

export const applicationKeyDetails = (application: Cas1Application | Cas1ApplicationSummary): KeyDetailsArgs =>
  personKeyDetails(application.person, application.risks?.tier?.value)
