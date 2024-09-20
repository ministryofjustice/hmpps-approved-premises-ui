import { OasysNotFoundError } from '../../../../services/personService'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { flattenCheckboxInput, isStringOrArrayOfStrings } from '../../../../utils/formUtils'
import { ApprovedPremisesApplication, OASysSection } from '../../../../@types/shared'
import { DataServices } from '../../../../@types/ui'
import { sentenceCase } from '../../../../utils/utils'

interface Response {
  needsLinkedToReoffending: Array<string> | string | Array<OASysSection>
  otherNeeds: Array<string> | string | Array<OASysSection>
}

interface Body {
  needsLinkedToReoffending: Array<OASysSection>
  otherNeeds: Array<OASysSection>
}

@Page({
  name: 'optional-oasys-sections',
  bodyProperties: ['needsLinkedToReoffending', 'otherNeeds'],
})
export default class OptionalOasysSections implements TasklistPage {
  title = 'Which of the following sections of OASys do you want to import?'

  needsLinkedToReoffendingHeading = 'Needs linked to reoffending'

  allNeedsLinkedToReoffending: Array<OASysSection> = []

  otherNeedsHeading = 'Needs not linked to risk of serious harm or reoffending'

  allOtherNeeds: Array<OASysSection> = []

  oasysSuccess: boolean = false

  oasysSectionsToExclude: Array<number> = [4, 5]

  constructor(public body: Partial<Body>) {}

  static async initialize(
    body: Partial<Response>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    const page = new OptionalOasysSections(body as Body)

    try {
      const oasysSelections = await dataServices.personService.getOasysSelections(token, application.person.crn)

      const allNeedsLinkedToReoffending = oasysSelections.filter(
        section => !section.linkedToHarm && section.linkedToReOffending,
      )
      // APS-1246 UI to remove sections 4 and 5 - finance and education
      const allOtherNeeds = oasysSelections.filter(
        section =>
          !section.linkedToHarm &&
          !section.linkedToReOffending &&
          !page.oasysSectionsToExclude.includes(section.section),
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
      page.oasysSuccess = true
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
    selectedSections: string | Array<string> | Array<OASysSection>,
    allSections: Array<OASysSection>,
  ): Array<OASysSection> {
    if (!selectedSections) {
      return []
    }

    if (isStringOrArrayOfStrings(selectedSections)) {
      const sectionIds = flattenCheckboxInput(selectedSections as string | Array<string>) || []

      return sectionIds.map(
        (need: string) => allSections.find((n: OASysSection) => need === n.section.toString()) as OASysSection,
      )
    }

    return selectedSections as Array<OASysSection>
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'rosh-summary'
  }

  response() {
    const response = {}

    if (this.body.needsLinkedToReoffending && this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending))
      response[this.needsLinkedToReoffendingHeading] = this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending)

    if (this.body.otherNeeds && this.getResponseForTypeOfNeed(this.body.otherNeeds))
      response[this.otherNeedsHeading] = this.getResponseForTypeOfNeed(this.body.otherNeeds)

    return response
  }

  getResponseForTypeOfNeed(typeOfNeed: Array<OASysSection>) {
    if (Array.isArray(typeOfNeed) && typeOfNeed.length) {
      return typeOfNeed.map(need => `${need.section}. ${sentenceCase(need.name)}`).join(', ')
    }
    return ''
  }

  errors() {
    return {}
  }
}
