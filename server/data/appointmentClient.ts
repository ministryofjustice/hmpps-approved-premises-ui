import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { AppointmentDto } from '../@types/shared/models/AppointmentDto'

export default class AppointmentClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('sessionAllocationClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async find(username: string, appointmentId: string): Promise<AppointmentDto> {
    const path = paths.appointments.singleAppointment({ appointmentId })
    return (await this.get({ path }, asSystem(username))) as AppointmentDto
  }
}
