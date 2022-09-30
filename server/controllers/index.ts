/* istanbul ignore file */

import ApplicationController from './applicationController'
import { controllers as apManageControllers } from './approved-premises/manage'
import { controllers as apApplyControllers } from './approved-premises/apply'

import type { Services as APServices } from '../services/approved-premises'

export const controllers = (apServices: APServices) => {
  const applicationController = new ApplicationController()

  return {
    applicationController,
    approvedPremises: {
      ...apManageControllers(apServices),
      ...apApplyControllers(apServices),
    }
  }
}

export type Controllers = ReturnType<typeof controllers>
