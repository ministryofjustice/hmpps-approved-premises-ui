import applyPaths from '../../paths/apply'
import { PlacementApplication, PlacementRequest } from '../../@types/shared'
import { linkTo } from '../utils'

export const applicationLink = (
  placementRequestOrApplication: PlacementRequest | PlacementApplication,
  text: string,
  hiddenText: string,
) => linkTo(applyPaths.applications.show({ id: placementRequestOrApplication.applicationId }), { text, hiddenText })
