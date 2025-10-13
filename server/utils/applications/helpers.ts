import { KeyDetailsArgs } from '@approved-premises/ui'
import { Cas1Application, Cas1ApplicationSummary, Person } from '../../@types/shared'
import { displayName, isFullPerson, tierBadge } from '../personUtils'
import paths from '../../paths/apply'
import { DateFormats } from '../dateUtils'

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
    return textValue(name)
  }

  return isFullPerson(person)
    ? htmlValue(
        `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${
          name
        }</a>`,
      )
    : textValue(name)
}

export const textValue = (value: string) => ({ text: value })

export const htmlValue = (value: string) => ({ html: value })

export const getTierOrBlank = (tier: string | null | undefined) => (tier ? tierBadge(tier) : '')

export const personKeyDetails = (person: Person, tier?: string): KeyDetailsArgs => ({
  header: { value: displayName(person), key: '', showKey: false },
  items: [
    { key: textValue('CRN'), value: textValue(person.crn) },
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
