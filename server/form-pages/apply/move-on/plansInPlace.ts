import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

type RawPlansInPlaceBody = Partial<PlansAreInPlaceBody | PlansNotInPlaceBody>

type PlansAreInPlaceBody = {
  arePlansInPlace: 'yes'
  plansInPlaceDetail: string
}

type PlansNotInPlaceBody = {
  arePlansInPlace: 'no'
  plansNotInPlaceDetail: string
}

@Page({ name: 'plans-in-place', bodyProperties: ['arePlansInPlace', 'plansInPlaceDetail', 'plansNotInPlaceDetail'] })
export default class PlansInPlace implements TasklistPage {
  name = 'plans-in-place'

  title = 'Placement duration and move on'

  questions = {
    arePlansInPlace: 'Are move on arrangements already in place for when the person leaves the AP?',
    plansInPlaceDetail:
      'Provide further detail about the accommodation type, including how the move on plan will be supported',
    plansNotInPlaceDetail: 'Provide detail about any plans to secure accommodation in preparation for move on',
  }

  constructor(private _body: RawPlansInPlaceBody) {}

  public get body(): PlansAreInPlaceBody | PlansNotInPlaceBody {
    if ('plansInPlaceDetail' in this._body) {
      return this._body as PlansAreInPlaceBody
    }
    return this._body as PlansNotInPlaceBody
  }

  public set body(value: RawPlansInPlaceBody) {
    this._body =
      value.arePlansInPlace === 'yes'
        ? ({
            arePlansInPlace: value.arePlansInPlace,
            plansInPlaceDetail: (value as PlansAreInPlaceBody).plansInPlaceDetail,
          } as PlansAreInPlaceBody)
        : ({
            arePlansInPlace: value.arePlansInPlace,
            plansNotInPlaceDetail: (value as PlansNotInPlaceBody).plansNotInPlaceDetail,
          } as PlansNotInPlaceBody)
  }

  previous() {
    return 'relocation-region'
  }

  next() {
    return 'type-of-accommodation'
  }

  response() {
    if ('plansInPlaceDetail' in this.body && this.body.arePlansInPlace === 'yes') {
      return {
        [this.questions.arePlansInPlace]: `Yes - ${this.body.plansInPlaceDetail}`,
      }
    }

    if ('plansNotInPlaceDetail' in this.body && this.body.arePlansInPlace === 'no') {
      return {
        [this.questions.arePlansInPlace]: `No - ${this.body.plansNotInPlaceDetail}`,
      }
    }

    return {}
  }

  errors() {
    const errors = {} as Record<string, string>

    if (!this.body.arePlansInPlace) {
      errors.arePlansInPlace =
        'You must answer whether move on arrangements are already in place for when the person leaves the AP'
    }

    if (this.body.arePlansInPlace === 'yes' && !this.body.plansInPlaceDetail) {
      errors.plansInPlaceDetail = 'You must provide further details of the move on plan'
    }

    if (this.body.arePlansInPlace === 'no' && !this.body.plansNotInPlaceDetail) {
      errors.plansNotInPlaceDetail =
        'You must provide detail about any plans to secure accommodation in preparation for move on'
    }

    return errors as TaskListErrors<this>
  }
}
