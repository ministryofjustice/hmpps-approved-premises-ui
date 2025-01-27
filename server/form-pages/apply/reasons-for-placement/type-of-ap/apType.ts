import type { BackwardsCompatibleApplyApType, RadioItem, TaskListErrors } from '@approved-premises/ui'

import { ApType, ApprovedPremisesApplication } from '@approved-premises/api'
import TasklistPage from '../../../tasklistPage'
import { convertArrayToRadioItems } from '../../../../utils/formUtils'
import { Page } from '../../../utils/decorators'
import { apTypeLabels } from '../../../../utils/apTypeLabels'

import { isWomensApplication } from '../../../../utils/applications/isWomensApplication'
import { apTypes } from '../../../../utils/placementCriteriaUtils'

export const womensApTypes: ReadonlyArray<ApType> = ['normal', 'pipe', 'esap']

@Page({ name: 'ap-type', bodyProperties: ['type'] })
export default class SelectApType implements TasklistPage {
  title = `Which type of AP does the person require?`

  availableTypes: ReadonlyArray<ApType>

  isWomensApplication: boolean

  constructor(
    public body: {
      type?: BackwardsCompatibleApplyApType
    },
    private readonly application: ApprovedPremisesApplication,
  ) {
    this.isWomensApplication = isWomensApplication(application)
    this.availableTypes = this.isWomensApplication ? womensApTypes : apTypes
  }

  previous() {
    return 'dashboard'
  }

  next() {
    if (this.body.type === 'pipe') return 'pipe-referral'
    if (this.body.type === 'esap') return 'managed-by-national-security-division'
    if (this.body.type === 'rfap') return 'rfap-details'

    return ''
  }

  response() {
    const type = this.body.type === 'standard' ? 'normal' : this.body.type

    return { [`${this.title}`]: apTypeLabels[type] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.type || !this.availableTypes.includes(this.body.type as ApType)) {
      errors.type = 'You must specify an AP type'
    }

    return errors
  }

  items() {
    return convertArrayToRadioItems(this.availableTypes, this.body.type, apTypeLabels, apTypeHintText)
  }
}

export const apTypeHintText: Partial<Record<ApType, RadioItem['hint']>> = {
  mhapElliottHouse: {
    html: `<p class="govuk-body govuk-hint">To apply for this type of placement a person must have a confirmed diagnosis of a severe and enduring mental illness e.g. paranoid schizophrenia / bipolar affective disorder (the primary diagnosis should not be personality disorder).</p>
        <p class="govuk-body govuk-hint">You will be required to complete and upload a <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/:w:/r/sites/ApprovedPremisesCareerDevelopment/Shared%20Documents/CRU/St%20Josephs%20Referral%20form.doc?d=w0e510931be504df7be3b360bbe1b37fe&csf=1&web=1&e=XZd9u4">supplementary form (opens in a new tab)</a> to NDelius before your application is submitted.</p>
      `,
  },
  mhapStJosephs: {
    html: `<p class="govuk-body govuk-hint">To apply for this type of placement a person must:</p>
      <ul class="govuk-list govuk-list--bullet govuk-hint">
        <li>have a confirmed diagnosis of a severe and enduring mental illness e.g. paranoid schizophrenia / bipolar affective disorder</li>
        <li>be managed by the Probation Service in Greater Manchester</li>
      </ul>
      <p class="govuk-body govuk-hint">They must also:</p>
      <ul class="govuk-list govuk-list--bullet govuk-hint">
        <li>have had a total of 6 months in a psychiatric ward or day hospital; or</li>
        <li>have had 3 admissions to hospital or day hospital; or</li>
        <li>have had 6 months of psychiatric community care involving more than one worker or the perceived need for such care if unavailable or refused; or</li>
        <li>be under the care of community mental health services and the CPA process; or</li>
        <li>be under the care of secondary care mental health services within a custodial setting as an alternative to community mental health services</li>
      </ul>
      <p class="govuk-body govuk-hint">You will be required to complete and upload a <a class="govuk-link" target="_blank" href="https://justiceuk.sharepoint.com/:w:/s/ApprovedPremisesCareerDevelopment/Eag6XVxypVBHhu-pBMrfvqIBTTva2uNFkKB9Tl6c6OX-jA?e=sGaEma">supplementary form (opens in a new tab)</a> to NDelius before your application is submitted.</p>
    `,
  },
  rfap: {
    html: `<p class="govuk-body govuk-hint">You'll need to provide details on whether:</p>
      <ul class="govuk-list govuk-list--bullet govuk-hint">
        <li>the person has resided in an incentivised substance-free living (ISFL) area in custody</li>
        <li>the person has interacted with the DART team in custody</li>
        <li>the person is willing to comply with the RFAP regime</li>
      </ul>
      <p class="govuk-body govuk-hint">While not mandatory for RFAP placement, this information aids in determining suitable alternative placements (AP).</p>
    `,
  },
}
