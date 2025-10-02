import { mockOffender } from '../../mockApis/appointments'
import Page from '../page'

export default class CheckProjectDetailsPage extends Page {
  constructor() {
    super(`${mockOffender.forename} ${mockOffender.surname}`)
  }
}
