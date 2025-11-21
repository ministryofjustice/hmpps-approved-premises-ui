import { Cas1SpaceBooking } from '@approved-premises/api'
import { TabItem } from '@approved-premises/ui'
import paths from '../../paths/manage'

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
