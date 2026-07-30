import { KeyDetailsArgs } from '@approved-premises/ui'
import { Cas1Application, Cas1ApplicationSummary, Person, PersonSummary, RiskTier } from '../../@types/shared'
import { displayName, isFullPerson, personTier, tierBadge, versionedTierBadge } from '../personUtils'
import paths from '../../paths/apply'
import { DateFormats } from '../dateUtils'
import { htmlCell, textCell } from '../tableUtils'
import config from '../../config'

export const createNameAnchorElement = (
  person: Person,
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

/**
 * @deprecated Use getVersionedTierOrBlank instead
 */
export const getTierOrBlank = (tier: string | null | undefined) => (tier ? tierBadge(tier) : '')

export const getVersionedTierOrBlank = (person: Person | PersonSummary, tierOnApplicationCreation?: RiskTier) => {
  if (!config.flags.useLiveTiers) {
    return getTierOrBlank(tierOnApplicationCreation?.level)
  }
  const tier = personTier(person)
  return tier ? versionedTierBadge(tier) : ''
}

export const personKeyDetails = (person: Person, tier?: string): KeyDetailsArgs => ({
  header: { value: displayName(person), key: '', showKey: false },
  items: [
    { key: textCell('CRN'), value: textCell(person.crn) },
    { key: { text: 'Tier' }, value: { text: tier || 'Not available' } },
    isFullPerson(person)
      ? {
          key: { text: 'Date of birth' },
          value: {
            text: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          },
        }
      : undefined,
  ],
})

export const applicationKeyDetails = (application: Cas1Application): KeyDetailsArgs =>
  personKeyDetails(application.person, application.risks?.tier?.value?.level)
