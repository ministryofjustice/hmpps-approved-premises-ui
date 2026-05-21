import { Task } from '../../../../utils/decorators'

import PreArrivalContact from './pre-arrival-contact'

@Task({
  slug: 'contact-resident',
  name: 'Contact resident',
  pages: [PreArrivalContact],
})
export default class PreArrivalContactResident {}
