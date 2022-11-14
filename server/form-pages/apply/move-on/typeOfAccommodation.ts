import type { TaskListErrors } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

import TasklistPage from '../../tasklistPage'

export const accommodationType = {
  ownAccomodation: 'Own accommodation',
  livingWithPartnerFamilyOrFriends: 'Living with partner, family or friends',
  rentedThroughLocalAuthority: 'Rented through local authority',
  rentedThroughHousingAssociation: 'Rented through housing association',
  privateRented: 'Private rented',
  supportedAccommodation: 'Supported accommodation',
  supportedHousing: 'Supported housing',
  cas3: 'CAS3 (Community Accommodation Service) provided',
  homeOffice: 'Accommodation provided through Home Office section 10 for foreign national',
  other: 'Other, please specify',
}

type AccommodationType = keyof typeof accommodationType & 'other'

export default class TypeOfAccommodation implements TasklistPage {
  name = 'type-of-accommodation'

  title = 'Placement duration and move on'

  question = `What type of accommodation will ${this.application.person.name} have when they leave the AP?`

  otherQuestion = accommodationType.other

  body: {
    accommodationType: AccommodationType
    otherAccommodationType: string
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      accommodationType: body.accommodationType as AccommodationType,
      otherAccommodationType: body.otherAccommodationType as string,
    }
  }

  previous() {
    return 'plans-in-place'
  }

  next() {
    return ''
  }

  response() {
    const response = { [this.question]: accommodationType[this.body.accommodationType] }

    if (this.body.accommodationType === 'other')
      return { ...response, [accommodationType.other]: this.body.otherAccommodationType }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.accommodationType) {
      errors.accommodationType = 'You must specify a type of accommodation'
    }

    if (this.body.accommodationType === 'other' && !this.body.otherAccommodationType) {
      errors.otherAccommodationType = 'You must specify the type of accommodation'
    }

    return errors
  }

  items() {
    return convertKeyValuePairToRadioItems(accommodationType, this.body.accommodationType).filter(
      type => type.value !== 'other',
    )
  }
}
