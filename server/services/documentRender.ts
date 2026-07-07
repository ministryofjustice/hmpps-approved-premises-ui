import { Cas1Application } from '@approved-premises/api'
import { getResponses } from '../utils/applications/getResponses'

export const documentRender = (application: Cas1Application): unknown => {
  return getResponses(application)
}
