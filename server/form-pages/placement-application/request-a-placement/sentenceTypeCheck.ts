import { DataServices, SummaryListItem, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { PlacementApplication, ReleaseTypeOption, SentenceTypeOption } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { convertKeyValuePairToRadioItems, summaryListItem } from '../../../utils/formUtils'
import { objectFilter, sentenceCase } from '../../../utils/utils'
import { sentenceTypes } from '../../../utils/applications/adjacentPageFromSentenceType'
import { allReleaseTypes } from '../../../utils/applications/releaseTypeUtils'

const bodyProperties: Array<string> = ['sentenceTypeCheck', 'applicationSentenceType', 'applicationReleaseType']

export type Body = {
  sentenceTypeCheck?: YesOrNo
  applicationSentenceType?: SentenceTypeOption
  applicationReleaseType?: ReleaseTypeOption
}

@Page({ name: 'sentence-type-check', bodyProperties })
export default class SentenceTypeCheck implements TasklistPage {
  title = 'Check the sentencing information'

  question = 'Has the sentence or release type changed?'

  yesNoOptions = convertKeyValuePairToRadioItems({ yes: 'Yes', no: 'No' })

  applicationReleaseType: ReleaseTypeOption

  applicationSentenceType: SentenceTypeOption

  summaryRows: Array<SummaryListItem>

  constructor(
    public body: Body,
    private placementApplication: PlacementApplication,
  ) {}

  static async initialize(
    body: Body,
    placementApplication: PlacementApplication,
    token: string,
    dataServices: DataServices,
  ): Promise<SentenceTypeCheck> {
    const page = new SentenceTypeCheck({ ...objectFilter(body, bodyProperties) }, placementApplication)
    if (body.applicationReleaseType) {
      page.applicationReleaseType = body.applicationReleaseType as ReleaseTypeOption
      page.applicationSentenceType = body.applicationSentenceType as SentenceTypeOption
    } else {
      const application = await dataServices.applicationService.findApplication(
        token,
        placementApplication.applicationId,
      )
      page.applicationReleaseType = application.releaseType
      page.applicationSentenceType = application.sentenceType
    }

    page.summaryRows = [
      summaryListItem('Sentence type', sentenceTypes[page.applicationSentenceType]),
      summaryListItem('Release type', allReleaseTypes[page.applicationReleaseType]),
    ]
    return page
  }

  previous() {
    return ''
  }

  next() {
    if (this.body.sentenceTypeCheck === 'no') {
      if (this.body.applicationReleaseType === 'rotl') return 'previous-rotl-placement'
      if (this.body.applicationReleaseType === 'paroleDirectedLicence') return 'decision-to-release'
      return 'additional-placement-details'
    }
    return 'sentence-type'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.sentenceTypeCheck),
      'Application sentence type': sentenceTypes[this.body.applicationSentenceType] || '',
      'Application release type': allReleaseTypes[this.body.applicationReleaseType] || '',
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sentenceTypeCheck) errors.sentenceTypeCheck = 'You must say if the sentence information is correct'
    return errors
  }
}
