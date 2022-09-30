/* istanbul ignore file */

import { RestClientBuilder } from '..'
import PremisesClient from './premisesClient'

export const dataAccess = () => ({
  premisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { PremisesClient }
