import type { TaskListErrors } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import ReleaseDate from './releaseDate'

export const placementPurposes = {
  publicProtection: 'Public protection',
  preventContact: 'Prevent contact with known individuals or victims',
  readjust: 'Help individual readjust to life outside of custody',
  drugAlcoholMonitoring: 'Provide drug or alcohol monitoring',
  preventSelfHarm: 'Increased monitoring of risk factors',
  otherReason: 'Other',
} as const

type PlacementPurposeT = keyof typeof placementPurposes
type PlacementPurposeBody = { placementPurposes?: Array<PlacementPurposeT> | PlacementPurposeT; otherReason?: string }
@Page({ name: 'placement-purpose', bodyProperties: ['placementPurposes', 'otherReason'] })
export default class PlacementPurpose implements TasklistPage {
  name = 'placement-purpose'

  title = `What is the purpose of the AP placement?`

  purposes = placementPurposes

  constructor(
    private _body: PlacementPurposeBody,
    private readonly application: ApprovedPremisesApplication,
  ) {
    this._body.placementPurposes = _body?.placementPurposes
      ? ([_body.placementPurposes].flat() as Array<PlacementPurposeT>)
      : []
  }

  public get body(): PlacementPurposeBody {
    if (!this.responseNeedsFreeTextReason(this._body)) {
      this._body.otherReason = undefined
    }

    return this._body
  }

  public set body(value: PlacementPurposeBody) {
    this._body = value
  }

  next() {
    return ''
  }

  previous() {
    if (noticeTypeFromApplication(this.application) === 'standard') {
      const knowReleaseDate = retrieveQuestionResponseFromFormArtifact(this.application, ReleaseDate, 'knowReleaseDate')

      if (knowReleaseDate === 'no') {
        return 'oral-hearing'
      }

      return 'placement-date'
    }

    return 'reason-for-short-notice'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.responseContainsReasons(this.body)) {
      errors.placementPurposes = 'You must choose at least one placement purpose'
    }

    if (this.responseNeedsFreeTextReason(this.body) && !this.body.otherReason) {
      errors.otherReason = 'You must explain the reason'
    }

    return errors
  }

  private responseContainsReasons(
    body: Record<string, unknown>,
  ): body is { placementPurposes: Array<PlacementPurposeT> } {
    if (body?.placementPurposes && Array.isArray(body.placementPurposes) && body.placementPurposes.length) {
      return true
    }
    return false
  }

  private responseNeedsFreeTextReason(body: Record<string, unknown>) {
    if (this.responseContainsReasons(body)) {
      if (body.placementPurposes.find(element => element === 'otherReason')) {
        return true
      }
    }
    return false
  }

  items(conditionalHtml: string) {
    const items = convertKeyValuePairToCheckBoxItems(
      placementPurposes,
      this.body?.placementPurposes as Array<PlacementPurposeT>,
    )
    const other = items.pop()

    items.push({
      divider: 'or',
    })

    return [...items, { ...other, conditional: { html: conditionalHtml } }]
  }

  response() {
    const response = {
      [this.title]: (this.body.placementPurposes as Array<PlacementPurposeT>)
        .map(purpose => placementPurposes[purpose])
        .join(', '),
    }

    if (this.body.otherReason) {
      response['Other purpose for AP Placement'] = this.body.otherReason
    }

    return response
  }
}
