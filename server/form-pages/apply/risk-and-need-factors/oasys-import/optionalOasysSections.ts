import { OasysNotFoundError } from '../../../../services/personService'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { flattenCheckboxInput, isStringOrArrayOfStrings } from '../../../../utils/formUtils'
import { ApprovedPremisesApplication, Cas1OASysSupportingInformationQuestionMetaData } from '../../../../@types/shared'
import { Cas1OASysMetadataUI, DataServices, type PageResponse } from '../../../../@types/ui'
import { sentenceCase } from '../../../../utils/utils'

interface Response {
  needsLinkedToReoffending: Array<string> | string | Array<Cas1OASysSupportingInformationQuestionMetaData>
  otherNeeds: Array<string> | string | Array<Cas1OASysSupportingInformationQuestionMetaData>
}

interface Body {
  needsLinkedToReoffending: Array<Cas1OASysSupportingInformationQuestionMetaData>
  otherNeeds: Array<Cas1OASysSupportingInformationQuestionMetaData>
}

@Page({
  name: 'optional-oasys-sections',
  bodyProperties: ['needsLinkedToReoffending', 'otherNeeds'],
})
export default class OptionalOasysSections implements TasklistPage {
  title = 'Which of the following sections of OASys do you want to import?'

  needsLinkedToReoffendingHeading = 'Needs linked to reoffending'

  allNeedsLinkedToReoffending: Array<Cas1OASysSupportingInformationQuestionMetaData> = []

  otherNeedsHeading = 'Needs not linked to risk of serious harm or reoffending'

  allOtherNeeds: Array<Cas1OASysSupportingInformationQuestionMetaData> = []

  oasysSuccess: boolean = false

  constructor(public body: Partial<Body>) {}

  static async initialize(
    body: Partial<Response>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    const page = new OptionalOasysSections(body as Body)

    try {
      const {
        supportingInformation,
        assessmentMetadata: { hasApplicableAssessment },
      }: Cas1OASysMetadataUI = await dataServices.personService.getOasysMetadata(token, application.person.crn)

      const allNeedsLinkedToReoffending = supportingInformation.filter(
        section => section && section.inclusionOptional && section.oasysAnswerLinkedToReOffending,
      )
      const allOtherNeeds = supportingInformation.filter(
        section => section && section.inclusionOptional && !section.oasysAnswerLinkedToReOffending,
      )

      if (body.needsLinkedToReoffending) {
        page.body.needsLinkedToReoffending = OptionalOasysSections.getSelectedNeeds(
          body.needsLinkedToReoffending,
          allNeedsLinkedToReoffending,
        )
      } else {
        page.body.needsLinkedToReoffending = []
      }

      if (body.otherNeeds) {
        page.body.otherNeeds = OptionalOasysSections.getSelectedNeeds(body.otherNeeds, allOtherNeeds)
      } else {
        page.body.otherNeeds = []
      }

      page.allNeedsLinkedToReoffending = allNeedsLinkedToReoffending
      page.allOtherNeeds = allOtherNeeds
      page.oasysSuccess = hasApplicableAssessment === undefined ? true : hasApplicableAssessment
    } catch (error) {
      if (error instanceof OasysNotFoundError) {
        page.oasysSuccess = false
        page.body.needsLinkedToReoffending = []
        page.body.otherNeeds = []
      } else {
        throw error
      }
    }

    return page
  }

  private static getSelectedNeeds(
    selectedSections: string | Array<string> | Array<Cas1OASysSupportingInformationQuestionMetaData>,
    allSections: Array<Cas1OASysSupportingInformationQuestionMetaData>,
  ): Array<Cas1OASysSupportingInformationQuestionMetaData> {
    if (!selectedSections) {
      return []
    }

    if (isStringOrArrayOfStrings(selectedSections)) {
      const sectionIds = flattenCheckboxInput(selectedSections as string | Array<string>) || []

      return sectionIds.map((need: string) =>
        allSections.find((n: Cas1OASysSupportingInformationQuestionMetaData) => need === n.section.toString()),
      )
    }

    return selectedSections as Array<Cas1OASysSupportingInformationQuestionMetaData>
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'rosh-summary'
  }

  response() {
    const response: PageResponse = {}

    if (this.body.needsLinkedToReoffending && this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending))
      response[this.needsLinkedToReoffendingHeading] = this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending)

    if (this.body.otherNeeds && this.getResponseForTypeOfNeed(this.body.otherNeeds))
      response[this.otherNeedsHeading] = this.getResponseForTypeOfNeed(this.body.otherNeeds)

    return response
  }

  getResponseForTypeOfNeed(typeOfNeed: Array<Cas1OASysSupportingInformationQuestionMetaData>) {
    if (Array.isArray(typeOfNeed) && typeOfNeed.length) {
      return typeOfNeed.map(need => `${need.section}. ${sentenceCase(need.sectionLabel)}`).join(', ')
    }
    return ''
  }

  errors() {
    return {}
  }
}
