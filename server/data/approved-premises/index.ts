/* istanbul ignore file */

import BookingClient from './bookingClient'

import PremisesClient from './premisesClient'
import ReferenceDataClient from '../referenceDataClient'
import PersonClient from './personClient'

import LostBedClient from './lostBedClient'
import ApplicationClient from './applicationClient'
import { RestClientBuilder } from '..'

export const dataAccess = () => ({
  approvedPremisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((token: string) => new BookingClient(token)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((token: string) =>
    new ReferenceDataClient(token)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((token: string) => new LostBedClient(token)) as RestClientBuilder<LostBedClient>,
  personClient: ((token: string) => new PersonClient(token)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((token: string) => new ApplicationClient(token)) as RestClientBuilder<ApplicationClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { BookingClient, PremisesClient, ReferenceDataClient, LostBedClient, PersonClient, ApplicationClient }
