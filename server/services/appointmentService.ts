import { AppointmentDto } from '../@types/shared'
import AppointmentClient from '../data/appointmentClient'

export default class AppointmentService {
  constructor(private readonly appointmentClient: AppointmentClient) {}

  async getAppointment(appointmentId: string, username: string): Promise<AppointmentDto> {
    const appointment = await this.appointmentClient.find(username, appointmentId)

    return appointment
  }
}
