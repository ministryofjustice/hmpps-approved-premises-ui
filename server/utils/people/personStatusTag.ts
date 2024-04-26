import { PersonStatus } from '../../@types/shared'
import { StatusTag, StatusTagOptions } from '../statusTag'

export class PersonStatusTag extends StatusTag<PersonStatus> {
  static readonly statuses: Record<PersonStatus, string> = {
    InCommunity: 'In Community',
    InCustody: 'In Custody',
    Unknown: 'Unknown',
  }

  constructor(status: PersonStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: PersonStatusTag.statuses,
      colours: undefined,
    })
  }
}
