/* eslint-disable no-param-reassign */
/* istanbul ignore file */

import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

import type { ErrorMessages, PersonStatus } from '@approved-premises/ui'
import {
  initialiseName,
  kebabCase,
  linkTo,
  mapApiPersonRisksForUi,
  removeBlankSummaryListItems,
  sentenceCase,
} from './utils'
import {
  cancellationReasonRadioItems,
  convertKeyValuePairToRadioItems,
  convertObjectsToRadioItems,
  convertObjectsToSelectOptions,
  dateFieldValues,
} from './formUtils'
import { dashboardTableRows } from './applications/utils'
import { navigationItems } from './navigationItems'

import { statusTag } from './personUtils'
import { DateFormats } from './dateUtils'

import * as AssessmentUtils from './assessments/utils'
import * as OASysUtils from './assessments/oasysUtils'
import * as OffenceUtils from './offenceUtils'
import * as AttachDocumentsUtils from './attachDocumentsUtils'
import * as OasysImportUtils from './oasysImportUtils'
import * as BookingUtils from './bookingUtils'
import * as TasklistUtils from './taskListUtils'
import * as FormUtils from './formUtils'
import * as UserUtils from './userUtils'
import * as TaskUtils from './tasks'
import * as PlacementRequestUtils from './placementRequests'
import * as MatchUtils from './matchUtils'
import * as SummaryListUtils from './applications/summaryListUtils'
import * as BedUtils from './bedUtils'
import * as LostBedUtils from './lostBedUtils'
import * as PhaseBannerUtils from './phaseBannerUtils'
import * as PlacementApplicationUtils from './placementApplications'

import managePaths from '../paths/manage'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import tasksPaths from '../paths/tasks'
import matchPaths from '../paths/match'
import placementApplicationsPaths from '../paths/placementApplications'
import { radioMatrixTable } from './radioMatrixTable'

import config from '../config'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Approved Premises'

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
      dev: true, // This is set to true to allow us to see the full stacktrace from errors in global functions, otherwise it gets swallowed and tricky to see in logs
    },
  )

  const markAsSafe = (html: string): string => {
    const safeFilter = njkEnv.getFilter('safe')
    return safeFilter(html)
  }

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addGlobal('dateFieldValues', dateFieldValues)
  njkEnv.addGlobal('formatDate', (date: string, options: { format: 'short' | 'long' } = { format: 'long' }) =>
    DateFormats.isoDateToUIDate(date, options),
  )
  njkEnv.addGlobal('formatDateTime', (date: string) => DateFormats.isoDateTimeToUIDateTime(date))
  njkEnv.addGlobal('dateObjToUIDate', (date: Date) => DateFormats.dateObjtoUIDate(date))
  njkEnv.addGlobal('dateFieldValues', function sendContextToDateFieldValues(fieldName: string, errors: ErrorMessages) {
    return dateFieldValues(fieldName, this.ctx, errors)
  })

  njkEnv.addGlobal(
    'convertObjectsToRadioItems',
    function sendContextConvertObjectsToRadioItems(
      items: Array<Record<string, string>>,
      textKey: string,
      valueKey: string,
      fieldName: string,
    ) {
      return convertObjectsToRadioItems(items, textKey, valueKey, fieldName, this.ctx)
    },
  )

  njkEnv.addGlobal(
    'cancellationReasonRadioItems',
    function sendContextToCancellationReasonRadioItems(items: Array<Record<string, string>>, appealHtml: string) {
      return cancellationReasonRadioItems(items, appealHtml, this.ctx)
    },
  )

  njkEnv.addGlobal(
    'convertObjectsToSelectOptions',
    function sendContextConvertObjectsToSelectOptions(
      items: Array<Record<string, string>>,
      prompt: string,
      textKey: string,
      valueKey: string,
      fieldName: string,
    ) {
      return convertObjectsToSelectOptions(items, prompt, textKey, valueKey, fieldName, this.ctx)
    },
  )
  njkEnv.addGlobal(
    'convertKeyValuePairToRadioItems',
    function sendConvertKeyValuePairToRadioItems(items: Record<string, string>, checkedItem: string) {
      return convertKeyValuePairToRadioItems(items, checkedItem)
    },
  )

  njkEnv.addGlobal(
    'placementRequirementsTable',
    function sendPlacementRequirementsTable(
      headings: Array<string>,
      requirements: Array<string>,
      preferences: Array<string>,
      body: Record<string, string>,
    ) {
      return radioMatrixTable(headings, requirements, preferences, body)
    },
  )

  njkEnv.addGlobal('paths', {
    ...managePaths,
    ...applyPaths,
    ...assessPaths,
    ...tasksPaths,
    ...matchPaths,
    ...placementApplicationsPaths,
  })

  njkEnv.addGlobal('linkTo', linkTo)

  njkEnv.addGlobal('statusTag', (status: PersonStatus) => markAsSafe(statusTag(status)))

  njkEnv.addGlobal('mergeObjects', (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    return { ...obj1, ...obj2 }
  })

  njkEnv.addGlobal('fetchContext', function fetchContext() {
    return this.ctx
  })

  njkEnv.addGlobal('oasysDisabled', config.flags.oasysDisabled)

  njkEnv.addFilter('mapApiPersonRisksForUi', mapApiPersonRisksForUi)

  njkEnv.addFilter('removeBlankSummaryListItems', removeBlankSummaryListItems)
  njkEnv.addFilter('sentenceCase', sentenceCase)
  njkEnv.addFilter('kebabCase', kebabCase)

  njkEnv.addGlobal('dashboardTableRows', dashboardTableRows)
  njkEnv.addGlobal('navigationItems', navigationItems)

  njkEnv.addGlobal('AssessmentUtils', AssessmentUtils)
  njkEnv.addGlobal('OASysUtils', OASysUtils)
  njkEnv.addGlobal('OffenceUtils', OffenceUtils)
  njkEnv.addGlobal('AttachDocumentsUtils', AttachDocumentsUtils)
  njkEnv.addGlobal('OasysImportUtils', OasysImportUtils)
  njkEnv.addGlobal('BookingUtils', BookingUtils)
  njkEnv.addGlobal('TasklistUtils', TasklistUtils)
  njkEnv.addGlobal('FormUtils', FormUtils)
  njkEnv.addGlobal('UserUtils', UserUtils)
  njkEnv.addGlobal('TaskUtils', TaskUtils)
  njkEnv.addGlobal('PlacementRequestUtils', PlacementRequestUtils)
  njkEnv.addGlobal('MatchUtils', MatchUtils)
  njkEnv.addGlobal('SummaryListUtils', SummaryListUtils)
  njkEnv.addGlobal('BedUtils', BedUtils)
  njkEnv.addGlobal('LostBedUtils', LostBedUtils)
  njkEnv.addGlobal('PhaseBannerUtils', PhaseBannerUtils)
  njkEnv.addGlobal('PlacementApplicationUtils', PlacementApplicationUtils)
}
