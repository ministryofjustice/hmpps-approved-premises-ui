import { ApArea, ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { DataServices, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { RestrictedPersonError } from '../../../../utils/errors'
import { isApplicableTier, isFullPerson } from '../../../../utils/personUtils'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

export const updatableDetails: ReadonlyArray<UpdatableDetails> = [
  'name',
  'emailAddress',
  'phoneNumber',
  'area',
] as const

type UpdatableDetails = 'name' | 'emailAddress' | 'phoneNumber' | 'area'

type UserDetailsFromDelius = {
  name?: string
  emailAddress?: string
  phoneNumber?: string
  area: ApArea['name']
}

export type Body = {
  detailsToUpdate?: Array<UpdatableDetails>
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
      items: updatableDetails,
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

  detailsToUpdate: ReadonlyArray<UpdatableDetails>

  constructor(
    readonly body: Body,
    readonly application: Application,
  ) {
    this.detailsToUpdate = body?.detailsToUpdate ?? []
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
      area: user.apArea.name,
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
    const response: Record<string, string> = {}

    const detailsToUpdate = (this.body?.detailsToUpdate || [])
      .map(detail => {
        return sentenceCase(detail)
      })
      .join(', ')

    response[this.questions.updateDetails.label] = detailsToUpdate.length ? detailsToUpdate : 'None'

    updatableDetails.forEach(detail => {
      if (this.body?.[detail] && this.body?.detailsToUpdate?.includes(detail)) {
        if (detail !== 'area') {
          response[this.responseKey(detail)] = this.body[detail]
        }
        if (detail === 'area') {
          response[`Applicant AP area`] = this.translateAreaIdToName(this.body.area)
        }
      } else if (this.body.userDetailsFromDelius?.[detail]) {
        response[this.responseKey(detail)] = this.body.userDetailsFromDelius?.[detail]
      } else {
        response[this.responseKey(detail)] = ''
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

    updatableDetails.forEach(detail => {
      if (this.body?.detailsToUpdate?.length && this.body?.detailsToUpdate.includes(detail) && !this.body[detail]) {
        errors[detail] = `You must enter your updated ${lowerCase(detail)}`
      }
    })

    if (!this.body.userDetailsFromDelius.area && !this.body.area) {
      errors.area = 'You must enter your AP area'
    }

    if (!this.body.caseManagementResponsibility) {
      errors.caseManagementResponsibility = 'You must enter whether you have case management responsibility'
    }

    return errors
  }

  private responseKey(detail: UpdatableDetails) {
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
