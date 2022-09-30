/* istanbul ignore file */

import { dataAccess } from '../../data/temporary-accommodation'

import PremisesService from './premisesService'

export const services = () => {
  const { premisesClientBuilder } = dataAccess()

  const premisesService = new PremisesService(premisesClientBuilder)

  return {
    premisesService,
  }
}

export type Services = ReturnType<typeof services>

export { PremisesService }
