/* istanbul ignore file */

import ApplicationController from './applicationController'
import { controllers as apManageControllers } from './approved-premises/manage'
import { controllers as apApplyControllers } from './approved-premises/apply'

import type { Services as APServices } from '../services/approved-premises'
import type { Services as TAServices } from '../services/temporary-accommodation'

export const controllers = (apServices: APServices, _taServices: TAServices) => {
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
