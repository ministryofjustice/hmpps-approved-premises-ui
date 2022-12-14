/* eslint-disable no-param-reassign */
/* istanbul ignore file */

import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

import type { ErrorMessages, PersonStatus, Task } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { initialiseName, removeBlankSummaryListItems, sentenceCase } from './utils'
import { dateFieldValues, convertObjectsToRadioItems, convertObjectsToSelectOptions } from './formUtils'
import { getTaskStatus, taskLink, getCompleteSectionCount, dashboardTableRows } from './applicationUtils'
import { checkYourAnswersSections } from './checkYourAnswersUtils'

import { statusTag } from './personUtils'
import bookingActions from './bookingUtils'
import { DateFormats } from './dateUtils'

import * as AssessmentUtils from './assessmentUtils'
import * as OffenceUtils from './offenceUtils'
import * as AttachDocumentsUtils from './attachDocumentsUtils'

import managePaths from '../paths/manage'
import applyPaths from '../paths/apply'

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

  njkEnv.addGlobal('bookingActions', bookingActions)

  njkEnv.addGlobal('paths', { ...managePaths, ...applyPaths })

  njkEnv.addGlobal('getCompleteSectionCount', getCompleteSectionCount)

  njkEnv.addGlobal('getTaskStatus', (task: Task, application: ApprovedPremisesApplication) =>
    markAsSafe(getTaskStatus(task, application)),
  )

  njkEnv.addGlobal('taskLink', (task: Task, application: ApprovedPremisesApplication) =>
    markAsSafe(taskLink(task, application)),
  )

  njkEnv.addGlobal('statusTag', (status: PersonStatus) => markAsSafe(statusTag(status)))

  njkEnv.addGlobal('mergeObjects', (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    return { ...obj1, ...obj2 }
  })

  njkEnv.addGlobal('fetchContext', function fetchContext() {
    return this.ctx
  })

  njkEnv.addFilter('removeBlankSummaryListItems', removeBlankSummaryListItems)
  njkEnv.addFilter('sentenceCase', sentenceCase)

  njkEnv.addGlobal('checkYourAnswersSections', checkYourAnswersSections)
  njkEnv.addGlobal('dashboardTableRows', dashboardTableRows)

  njkEnv.addGlobal('AssessmentUtils', AssessmentUtils)
  njkEnv.addGlobal('OffenceUtils', OffenceUtils)
  njkEnv.addGlobal('AttachDocumentsUtils', AttachDocumentsUtils)
}
