import { Cas1SpaceBooking, FullPerson } from '@approved-premises/api'
import { TabItem } from '@approved-premises/ui'
import paths from '../../paths/manage'
import { DateFormats } from '../dateUtils'
import { detailedStatus, statusTextMap } from '../placements/status'

export type ResidentProfileTab = 'personal' | 'health' | 'placement' | 'risk' | 'sentence' | 'enforcement'

export const tabLabels: Record<
  ResidentProfileTab,
  { label: string; disableRestricted?: boolean; disableOffline?: boolean }
> = {
  personal: { label: 'Personal' },
  health: { label: 'Health' },
  placement: { label: 'Placement' },
  risk: { label: 'Risk' },
  sentence: { label: 'Offence and sentence' },
  enforcement: { label: 'Enforcement' },
}

export const residentTabItems = (placement: Cas1SpaceBooking, activeTab: ResidentProfileTab): Array<TabItem> => {
  const getSelfLink = (tab: ResidentProfileTab): string => {
    const pathRoot = paths.resident
    const pathParams = { placementId: placement.id, crn: placement.person.crn }
    switch (tab) {
      case 'personal':
        return pathRoot.tabPersonal(pathParams)
      case 'health':
        return pathRoot.tabHealth(pathParams)
      case 'placement':
        return pathRoot.tabPlacement(pathParams)
      case 'risk':
        return pathRoot.tabRisk(pathParams)
      case 'sentence':
        return pathRoot.tabSentence(pathParams)
      case 'enforcement':
        return pathRoot.tabEnforcement(pathParams)
      default:
        return pathRoot.show(pathParams)
    }
  }
  return Object.entries(tabLabels).map(([key, { label }]) => ({
    text: label,
    active: activeTab === key,
    href: getSelfLink(key as ResidentProfileTab),
  }))
}

export function getResidentHeader(placement: Cas1SpaceBooking) {
  const person = placement.person as FullPerson

  return {
    name: person.name,
    photoUrl: '/assets/images/resident-placeholder.png',
    badges: [
      getBadge('Unknown RoSH', 'red'),
      getBadge('Unknown MAPPA', 'purple'),
      getBadge('Unknown ', 'black'),
      getBadge('Unknown 2', 'black'),
      getBadge('Unknown 3', 'black'),
      '<span><a href="#">+3 risk flags</a></span>',
    ],
    attributes: [
      [
        { title: 'CRN', description: person.crn },
        { title: 'Approved Premises', description: placement.premises.name },
        { title: 'Key worker', description: placement.keyWorkerAllocation?.name ?? 'Not assigned' },
      ],
      [
        {
          title: 'Arrival',
          description: DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'short' }),
        },
        {
          title: 'Departure',
          description: DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'short' }),
        },
        { title: 'Status', description: getResidentStatus(placement) },
        {
          title: 'Length of stay',
          description: DateFormats.durationBetweenDates(placement.expectedArrivalDate, placement.expectedDepartureDate)
            .ui,
        },
      ],
    ],
  }
}

function getBadge(text: string, colour: string) {
  return `<span class="moj-badge moj-badge--${colour}">${text}</span>`
}

export function getResidentStatus(placement: Cas1SpaceBooking): string {
  return statusTextMap[detailedStatus(placement)]
}
