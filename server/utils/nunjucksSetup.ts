/* eslint-disable no-param-reassign */
/* istanbul ignore file */

import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

import type { ErrorMessages, JourneyType, PersonStatus, Task } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { initialiseName, removeBlankSummaryListItems, sentenceCase, mapApiPersonRisksForUi, kebabCase } from './utils'
import { dateFieldValues, convertObjectsToRadioItems, convertObjectsToSelectOptions } from './formUtils'
import { getTaskStatus, getCompleteSectionCount, dashboardTableRows } from './applicationUtils'
import { checkYourAnswersSections } from './checkYourAnswersUtils'
import taskLinkHelper from './taskListUtils'

import { statusTag } from './personUtils'
import { DateFormats } from './dateUtils'

import * as AssessmentUtils from './assessmentUtils'
import * as OffenceUtils from './offenceUtils'
import * as AttachDocumentsUtils from './attachDocumentsUtils'
import * as OasysImportUtils from './oasysImportUtils'
import * as BookingUtils from './bookingUtils'

import managePaths from '../paths/manage'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'

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

  njkEnv.addGlobal('paths', { ...managePaths, ...applyPaths, ...assessPaths })

  njkEnv.addGlobal('getCompleteSectionCount', getCompleteSectionCount)

  njkEnv.addGlobal('getTaskStatus', (task: Task, application: ApprovedPremisesApplication) =>
    markAsSafe(getTaskStatus(task, application)),
  )

  njkEnv.addGlobal('taskLink', (task: Task, application: ApprovedPremisesApplication, journeyType?: JourneyType) =>
    markAsSafe(taskLinkHelper(task, application, journeyType)),
  )

  njkEnv.addGlobal('statusTag', (status: PersonStatus) => markAsSafe(statusTag(status)))

  njkEnv.addGlobal('mergeObjects', (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    return { ...obj1, ...obj2 }
  })

  njkEnv.addGlobal('fetchContext', function fetchContext() {
    return this.ctx
  })

  njkEnv.addFilter('mapApiPersonRisksForUi', mapApiPersonRisksForUi)

  njkEnv.addFilter('removeBlankSummaryListItems', removeBlankSummaryListItems)
  njkEnv.addFilter('sentenceCase', sentenceCase)
  njkEnv.addFilter('kebabCase', kebabCase)

  njkEnv.addGlobal('checkYourAnswersSections', checkYourAnswersSections)
  njkEnv.addGlobal('dashboardTableRows', dashboardTableRows)

  njkEnv.addGlobal('AssessmentUtils', AssessmentUtils)
  njkEnv.addGlobal('OffenceUtils', OffenceUtils)
  njkEnv.addGlobal('AttachDocumentsUtils', AttachDocumentsUtils)
  njkEnv.addGlobal('OasysImportUtils', OasysImportUtils)
  njkEnv.addGlobal('BookingUtils', BookingUtils)
}
