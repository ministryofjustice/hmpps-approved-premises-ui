import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { flattenCheckboxInput, isStringOrArrayOfStrings } from '../../../../utils/formUtils'
import { Application, OASysSection } from '../../../../@types/shared'
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

  allNeedsLinkedToReoffending: Array<OASysSection>

  otherNeedsHeading = 'Needs not linked to risk of serious harm or reoffending'

  allOtherNeeds: Array<OASysSection>

  constructor(public body: Partial<Body>) {}

  static async initialize(
    body: Partial<Response>,
    application: Application,
    token: string,
    dataServices: DataServices,
  ) {
    const oasysSelections = await dataServices.personService.getOasysSelections(token, application.person.crn)

    const allNeedsLinkedToReoffending = oasysSelections.filter(
      section => !section.linkedToHarm && section.linkedToReOffending,
    )
    const allOtherNeeds = oasysSelections.filter(section => !section.linkedToHarm && !section.linkedToReOffending)

    const fullLists = {
      needsLinkedToReoffending: allNeedsLinkedToReoffending,
      otherNeeds: allOtherNeeds,
    }

    const lists = ['needsLinkedToReoffending', 'otherNeeds']

    lists.forEach(section => {
      if (isStringOrArrayOfStrings(body[section])) {
        body[section] = flattenCheckboxInput(body[section])
      }

      body[section] = (body[section] || []).map((need: string) =>
        fullLists[section].find((n: OASysSection) => need === n.section.toString()),
      )
    })

    const page = new OptionalOasysSections(body as Body)

    page.allNeedsLinkedToReoffending = allNeedsLinkedToReoffending
    page.allOtherNeeds = allOtherNeeds

    return page
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    if (this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending))
      response[this.needsLinkedToReoffendingHeading] = this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending)

    if (this.getResponseForTypeOfNeed(this.body.otherNeeds))
      response[this.otherNeedsHeading] = this.getResponseForTypeOfNeed(this.body.otherNeeds)

    return response
  }

  getResponseForTypeOfNeed(typeOfNeed: Array<OASysSection>) {
    if (Array.isArray(typeOfNeed) && typeOfNeed.length) {
      return typeOfNeed.map(need => `${need.section}. ${sentenceCase(need.name)}`).join(', ')
    }
    return ''
  }

  reoffendingNeedsItems() {
    return this.checkboxes(this.allNeedsLinkedToReoffending, this.body.needsLinkedToReoffending)
  }

  otherNeedsItems() {
    return this.checkboxes(this.allOtherNeeds, this.body.otherNeeds)
  }

  private checkboxes(fullList: Array<OASysSection>, selectedList: Array<OASysSection>) {
    return fullList.map(need => {
      const sectionAndName = `${need.section}. ${sentenceCase(need.name)}`
      return {
        value: need.section.toString(),
        text: sectionAndName,
        checked: selectedList.map(n => n.section).includes(need.section),
      }
    })
  }

  errors() {
    return {}
  }
}
