import { getPageBackLink } from '../utils/backlinks'

export default class SessionService {
  constructor() {}

  /**
   * @deprecated The method should not be used via this service. Use it directly instead
   */
  getPageBackLink = getPageBackLink
}
