import Page from '../../page'
import { Cas1OutOfServiceBed as OutOfServiceBed } from '../../../../server/@types/shared'

export class OutOfServiceBedUpdatePage extends Page {
  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('Update out of service bed record')
  }
}
