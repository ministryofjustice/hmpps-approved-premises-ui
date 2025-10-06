import { OffenderDto, OffenderFullDto } from '../@types/shared'

export default class Offender {
  readonly name: string

  readonly isLimited: boolean

  readonly crn: string

  constructor(offender: OffenderDto) {
    this.isLimited = offender.objectType !== 'Full'
    this.crn = offender.crn
    this.name = this.getName(offender)
  }

  private getName(offender: OffenderDto): string {
    if (this.isLimited) {
      return ''
    }

    const fullOffender = offender as OffenderFullDto

    return `${fullOffender.forename} ${fullOffender.surname}`
  }
}
