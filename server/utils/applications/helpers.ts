import { ApprovedPremisesApplicationSummary as ApplicationSummary, Person } from '../../@types/shared'
import { displayName, isFullPerson, tierBadge } from '../personUtils'
import paths from '../../paths/apply'

export const createNameAnchorElement = (
  person: Person,
  applicationSummary: ApplicationSummary,
  {
    linkInProgressApplications,
    showCrn,
  }: {
    linkInProgressApplications?: boolean
    showCrn?: boolean
  } = { linkInProgressApplications: true, showCrn: false },
) => {
  const name = displayName(person, showCrn)

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

export const textValue = (value: string) => {
  return { text: value }
}

export const htmlValue = (value: string) => {
  return { html: value }
}

export const getTierOrBlank = (tier: string | null | undefined) => (tier ? tierBadge(tier) : '')
