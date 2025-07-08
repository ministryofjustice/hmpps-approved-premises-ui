import { Cas1PlacementRequestDetail, PlacementApplication } from '@approved-premises/api'
import applyPaths from '../../paths/apply'
import { linkTo } from '../utils'

export const applicationLink = (
  placementRequestOrApplication: Cas1PlacementRequestDetail | PlacementApplication,
  text: string,
  hiddenText: string,
) => linkTo(applyPaths.applications.show({ id: placementRequestOrApplication.applicationId }), { text, hiddenText })
