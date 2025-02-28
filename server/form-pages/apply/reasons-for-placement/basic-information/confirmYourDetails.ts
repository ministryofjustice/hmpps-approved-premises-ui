import { ApArea, ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { RestrictedPersonError } from '../../../../utils/errors'
import { isApplicableTier, isFullPerson } from '../../../../utils/personUtils'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

const updatableDetailsLabels: Record<string, string> = {
  area: 'AP area',
}

export const userDetailsKeys: Array<keyof UserDetails> = ['name', 'emailAddress', 'phoneNumber', 'area']

export type UserDetails = {
  name: string
  emailAddress: string
  phoneNumber: string
  area: ApArea['id']
}

export type UserDetailsFromDelius = Omit<UserDetails, 'area'> & {
  area: ApArea
}

export type Body = {
  detailsToUpdate?: Array<keyof UserDetails>
  emailAddress?: string
  name?: string
  phoneNumber?: string
  caseManagementResponsibility?: YesOrNo
  userDetailsFromDelius?: UserDetailsFromDelius
  area?: ApArea['name']
  areas?: Array<ApArea>
}

@Page({
  name: 'confirm-your-details',
  bodyProperties: [
    'detailsToUpdate',
    'emailAddress',
    'name',
    'phoneNumber',
    'caseManagementResponsibility',
    'userDetailsFromDelius',
    'area',
    'areas',
  ],
})
export default class ConfirmYourDetails implements TasklistPage {
  title = 'Confirm your details'

  questions = {
    updateDetails: {
      label: 'If you need to update your details, select the relevant box below',
      hint: `<p class="govuk-hint">Select all that need to be changed.</p>
      <p class="govuk-hint">This information will not be written back to Delius</p>`,
      items: userDetailsKeys,
    },
    caseManagementResponsibility: {
      label: 'Do you have case management responsibility?',
    },
    name: {
      label: 'Name',
    },
    emailAddress: {
      label: 'Email address',
    },
    phoneNumber: {
      label: 'Phone number',
    },
    area: {
      label: 'AP area',
    },
  }

  userDetailsFromDelius: UserDetailsFromDelius

  detailsToUpdate: Array<keyof UserDetails>

  public get body(): Body {
    let area

    if (this._body?.area) {
      // if there is an area in the body, return that
      area = this._body.area
    } else if (this._body?.detailsToUpdate?.includes('area') && !this._body.area) {
      // if the user said they need to update their area but didn't enter anything return an empty string
      area = ''
    } else if (this._body.userDetailsFromDelius?.area) {
      // if there is an area in delius return its ID
      area = this._body.userDetailsFromDelius?.area.id
    } else {
      // otherwise we don't know the area
      area = ''
    }

    return { ...this._body, area }
  }

  public set body(value) {
    this._body = value
  }

  constructor(
    private _body: Body,
    readonly application: Application,
  ) {
    this.detailsToUpdate = _body?.detailsToUpdate ?? []
  }

  static async initialize(
    body: Body,
    application: Application,
    token: string,
    dataServices: DataServices,
  ): Promise<ConfirmYourDetails> {
    const user = await dataServices.userService.getUserById(token, application.createdByUserId)
    const areas = await dataServices.apAreaService.getApAreas(token)

    const userForUi = {
      name: user.name,
      emailAddress: user.email,
      phoneNumber: user.telephoneNumber,
      area: user.apArea,
    }

    const page = new ConfirmYourDetails(
      {
        ...body,
        userDetailsFromDelius: userForUi,
        areas,
      },
      application,
    )

    page.userDetailsFromDelius = userForUi

    return page
  }

  response() {
    const response: PageResponse = {}

    const detailsToUpdate = (this.body?.detailsToUpdate || [])
      .map(detail => {
        return sentenceCase(detail)
      })
      .join(', ')

    response[this.questions.updateDetails.label] = detailsToUpdate.length ? detailsToUpdate : 'None'

    userDetailsKeys.forEach(detailKey => {
      if (this.body?.[detailKey] && this.body?.detailsToUpdate?.includes(detailKey)) {
        if (detailKey !== 'area') {
          response[this.responseKey(detailKey)] = this.body[detailKey]
        }
        if (detailKey === 'area') {
          response[`Applicant AP area`] = this.translateAreaIdToName(this.body.area)
        }
      } else if (this.body.userDetailsFromDelius?.[detailKey]) {
        if (detailKey !== 'area') {
          response[this.responseKey(detailKey)] = this.body.userDetailsFromDelius?.[detailKey]
        }
        if (detailKey === 'area') {
          response[`Applicant AP area`] = this.translateAreaIdToName(this.body.userDetailsFromDelius?.[detailKey].id)
        }
      } else {
        response[this.responseKey(detailKey)] = ''
      }
    })

    response[this.questions.caseManagementResponsibility.label] = sentenceCase(this.body.caseManagementResponsibility)

    return response
  }

  previous() {
    // This shouldn't happen at this point in the journey as LAO checks are completed at the start of application but is preferable to casting
    if (!isFullPerson(this.application.person)) {
      throw new RestrictedPersonError(this.application.person.crn)
    }

    return isApplicableTier(this.application.person.sex, this.application.risks?.tier?.value?.level)
      ? 'dashboard'
      : 'exception-details'
  }

  next() {
    return this.body.caseManagementResponsibility === 'yes' ? 'transgender' : 'case-manager-information'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    userDetailsKeys.forEach(detailKey => {
      if (
        this.body?.detailsToUpdate?.length &&
        this.body?.detailsToUpdate.includes(detailKey) &&
        !this.body[detailKey]
      ) {
        errors[detailKey] = `You must enter your updated ${lowerCase(detailKey)}`
      }
    })

    userDetailsKeys.forEach(detailKey => {
      if (!this.body.userDetailsFromDelius[detailKey] && !this.body[detailKey]) {
        const label = updatableDetailsLabels[detailKey] ? updatableDetailsLabels[detailKey] : lowerCase(detailKey)
        errors[detailKey] = `You must enter your ${label}`
      }
    })

    if (!this.body.caseManagementResponsibility) {
      errors.caseManagementResponsibility = 'You must enter whether you have case management responsibility'
    }

    return errors
  }

  private responseKey(detail: keyof UserDetails) {
    const { label } = this.questions[detail]

    if (detail !== 'area') return `Applicant ${lowerCase(label)}`

    return `Applicant ${label}`
  }

  private translateAreaIdToName(areaId: ApArea['id']): ApArea['name'] {
    return this.body.areas.find(apAreas => {
      return apAreas.id === areaId
    }).name
  }
}
