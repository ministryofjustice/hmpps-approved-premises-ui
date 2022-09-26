/* eslint-disable no-param-reassign */
/* istanbul ignore file */

import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

import type { ErrorMessages, ApplicationData, TaskNames } from 'approved-premises'
import { initialiseName } from './utils'
import { dateFieldValues, convertObjectsToRadioItems, convertObjectsToSelectOptions } from './formUtils'
import { getTaskStatus, taskLink } from './applicationUtils'
import bookingActions from './bookingUtils'
import { DateFormats } from './dateUtils'

import managePaths from '../paths/manage'
import applyPaths from '../paths/apply'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Approved Premises Ui'

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
  njkEnv.addGlobal('formatDate', DateFormats.isoDateToUIDate)

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
      textKey: string,
      valueKey: string,
      fieldName: string,
    ) {
      return convertObjectsToSelectOptions(items, textKey, valueKey, fieldName, this.ctx)
    },
  )

  njkEnv.addGlobal('bookingActions', bookingActions)

  njkEnv.addGlobal('paths', { ...managePaths, ...applyPaths })

  njkEnv.addGlobal('getTaskStatus', (task: TaskNames, application: ApplicationData) =>
    markAsSafe(getTaskStatus(task, application)),
  )

  njkEnv.addGlobal('taskLink', (task: TaskNames, id: string) => markAsSafe(taskLink(task, id)))
}
