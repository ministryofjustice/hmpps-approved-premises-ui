import type { DataServices, TaskListErrors } from '@approved-premises/ui'
import { ApprovedPremisesApplication as Application, Cas1PremisesBasicSummary } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { numberToOrdinal } from '../../../../utils/utils'

export type PreferredApsBody = {
  preferredAp1: string
  preferredAp2: string
  preferredAp3: string
  preferredAp4: string
  preferredAp5: string
  selectedAps: Array<Cas1PremisesBasicSummary>
}

const preferredAps = new Array(5).fill('').map((_, i) => `preferredAp${i + 1}`)

type SelectorAttributes = {
  'data-premises-with-areas'?: boolean
  'data-region-prompt'?: string
}
@Page({
  name: 'preferred-aps',
  bodyProperties: [...preferredAps, 'selectedAps'],
})
export default class PreferredAps implements TasklistPage {
  title: string

  allPremises: Array<Cas1PremisesBasicSummary> = []

  preferredApOptions = preferredAps

  preferredApLabels = this.preferredApOptions.map((_, i) => `${numberToOrdinal(i)} choice AP`)

  selectorAttributes: SelectorAttributes

  body: PreferredApsBody

  constructor(private _: Partial<PreferredApsBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: Application,
    token: string,
    { premisesService }: DataServices,
  ) {
    const { isWomensApplication } = application
    const allPremises = await premisesService.getCas1All(token, { gender: isWomensApplication ? 'woman' : 'man' })

    const selectedAps: Array<Cas1PremisesBasicSummary> = []
    preferredAps.forEach(id => {
      const selectedAp = allPremises.find(premises => {
        return premises.id === body[id]
      })
      if (selectedAp) {
        selectedAps.push(selectedAp)
      }
    })

    body.selectedAps = selectedAps

    const page = new PreferredAps(body)
    page.title = isWomensApplication
      ? 'Select all preferred properties for your women’s AP application'
      : 'Select a preferred AP'
    page.selectorAttributes = isWomensApplication
      ? {}
      : {
          'data-premises-with-areas': true,
          'data-region-prompt': 'No preference',
        }
    page.allPremises = allPremises
    return page
  }

  previous() {
    return 'describe-location-factors'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (!this.body.preferredAp1) {
      errors.preferredAp1 = 'You must select one preferred Approved Premises'
    }

    return errors
  }

  response() {
    const response = {}
    this.preferredApOptions.forEach((key, i) => {
      const apName = this.body.selectedAps.find(premises => premises.id === this.body[key])?.name

      response[this.preferredApLabels[i]] = apName ?? 'No preference'
    })

    return response
  }
}
