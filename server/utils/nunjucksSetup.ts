/* istanbul ignore file */

import * as pathModule from 'path'
import nunjucks from 'nunjucks'
import express from 'express'

import type { ErrorMessages, TaskStatus as TaskListStatus, UiTask } from '@approved-premises/ui'
import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesApplicationStatus as ApplicationStatus,
  Cas1Assessment as Assessment,
  PersonStatus,
  TaskStatus,
} from '@approved-premises/api'
import fs from 'fs'
import {
  initialiseName,
  kebabCase,
  linebreaksToParagraphs,
  linkTo,
  mapApiPersonRisksForUi,
  numberToOrdinal,
  removeBlankSummaryListItems,
  sentenceCase,
} from './utils'
import {
  convertKeyValuePairToRadioItems,
  convertObjectsToRadioItems,
  convertObjectsToSelectOptions,
  dateFieldValues,
} from './formUtils'
import { relevantDatesOptions } from './applications/relevantDatesOptions'
import { navigationItems } from './navigationItems'

import { StatusTagOptions } from './statusTag'
import { ApplicationStatusTag } from './applications/statusTag'
import { DateFormats, monthOptions, uiDateOrDateEmptyMessage, yearOptions } from './dateUtils'
import { pagination } from './pagination'
import { sortHeader } from './sortHeader'
import { SubmittedDocumentRenderer } from './forms/submittedDocumentRenderer'

import * as ApplyUtils from './applications/utils'
import * as AssessmentUtils from './assessments/utils'
import * as AssessmentTableUtils from './assessments/tableUtils'
import * as OASysUtils from './assessments/oasysUtils'
import * as OffenceUtils from './offenceUtils'
import * as AttachDocumentsUtils from './attachDocumentsUtils'
import * as OasysImportUtils from './oasysImportUtils'
import * as CancellationUtils from './cancellationUtils'
import * as TasklistUtils from './taskListUtils'
import * as FormUtils from './formUtils'
import * as UserUtils from './users'
import * as TaskUtils from './tasks'
import * as PlacementRequestUtils from './placementRequests'
import * as SummaryListUtils from './applications/summaryListUtils'
import * as BedUtils from './bedUtils'
import * as OutOfServiceBedUtils from './outOfServiceBedUtils'
import * as PlacementApplicationUtils from './placementApplications'
import * as PremisesUtils from './premises'
import * as PlacementUtils from './placements'
import * as ReportUtils from './reportUtils'

import managePaths from '../paths/manage'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import tasksPaths from '../paths/tasks'
import matchPaths from '../paths/match'
import adminPaths from '../paths/admin'
import peoplePaths from '../paths/people'
import staticPaths from '../paths/static'
import placementApplicationsPaths from '../paths/placementApplications'
import * as AppealsUtils from './appealsUtils'

import config from '../config'
import { withdrawalRadioOptions } from './applications/withdrawalReasons'
import { PersonStatusTag } from './people/personStatusTag'
import { TaskStatusTag } from './tasks/statusTag'
import { displayName } from './personUtils'
import logger from '../../logger'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Approved Premises'
  app.locals.applicationInsightsConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || undefined

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist',
      'node_modules/@ministryofjustice/frontend',
    ],
    {
      autoescape: true,
      express: app,
      dev: true, // This is set to true to allow us to see the full stacktrace from errors in global functions, otherwise it gets swallowed and tricky to see in logs
    },
  )

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addGlobal('displayName', displayName)
  njkEnv.addGlobal('dateFieldValues', dateFieldValues)
  njkEnv.addGlobal('formatDate', (date: string, options: { format: 'short' | 'long' } = { format: 'long' }) =>
    DateFormats.isoDateToUIDate(date, options),
  )
  njkEnv.addGlobal('formatDuration', (days: number) => DateFormats.formatDuration(days))
  njkEnv.addGlobal('formatDateTime', (date: string) => DateFormats.isoDateTimeToUIDateTime(date))
  njkEnv.addGlobal('dateObjToUIDate', (date: Date) => DateFormats.dateObjtoUIDate(date))
  njkEnv.addGlobal(
    'dateFieldValues',
    function sendContextToDateFieldValues(fieldName: string, errors: ErrorMessages, defaultToToday = false) {
      return dateFieldValues(fieldName, this.ctx, errors, defaultToToday)
    },
  )
  njkEnv.addGlobal(
    'uiDateOrDateEmptyMessage',
    (object: Record<string, string>, propertyName: string, dateFormFunc: (date: string) => string) =>
      uiDateOrDateEmptyMessage(object, propertyName, dateFormFunc),
  )

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
      selectAllValue = '',
    ) {
      return convertObjectsToSelectOptions(items, prompt, textKey, valueKey, fieldName, selectAllValue, this.ctx)
    },
  )
  njkEnv.addGlobal(
    'convertKeyValuePairToRadioItems',
    function sendConvertKeyValuePairToRadioItems(items: Record<string, string>, checkedItem: string) {
      return convertKeyValuePairToRadioItems(items, checkedItem)
    },
  )

  njkEnv.addGlobal('paths', {
    ...managePaths,
    ...applyPaths,
    ...assessPaths,
    ...tasksPaths,
    ...matchPaths,
    ...placementApplicationsPaths,
    ...adminPaths,
    ...peoplePaths,
    ...staticPaths,
  })

  njkEnv.addGlobal('linkTo', linkTo)

  njkEnv.addGlobal('mergeObjects', (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    return { ...obj1, ...obj2 }
  })

  njkEnv.addGlobal('fetchContext', function fetchContext() {
    return this.ctx
  })

  njkEnv.addGlobal('oasysDisabled', config.flags.oasysDisabled)

  njkEnv.addFilter('mapApiPersonRisksForUi', mapApiPersonRisksForUi)
  njkEnv.addGlobal(
    'applicationStatusTag',
    function applicationStatusTag(status: ApplicationStatus, options?: StatusTagOptions) {
      return new ApplicationStatusTag(status, options).html()
    },
  )
  njkEnv.addGlobal('taskStatusTag', function taskStatusTag(status: TaskStatus, options?: StatusTagOptions) {
    return new TaskStatusTag(status, options).html()
  })
  njkEnv.addGlobal('taskListStatusTag', function taskStatusTag(status: TaskListStatus, id: UiTask['id']) {
    return new TasklistUtils.TaskListStatusTag(status, id).html()
  })
  njkEnv.addGlobal('personStatusTag', function personStatusTag(status: PersonStatus, options?: StatusTagOptions) {
    return new PersonStatusTag(status, options).html()
  })

  njkEnv.addFilter('removeBlankSummaryListItems', removeBlankSummaryListItems)
  njkEnv.addFilter('sentenceCase', sentenceCase)
  njkEnv.addFilter('kebabCase', kebabCase)
  njkEnv.addFilter('addCommasToList', (arg, notLastItem) => (notLastItem ? `${arg}, ` : arg))

  njkEnv.addFilter('linebreaksToParagraphs', linebreaksToParagraphs)

  njkEnv.addGlobal('numberToOrdinal', numberToOrdinal)
  njkEnv.addGlobal('navigationItems', navigationItems)
  njkEnv.addGlobal('withdrawalRadioOptions', withdrawalRadioOptions)
  njkEnv.addGlobal('relevantDatesOptions', relevantDatesOptions)
  njkEnv.addGlobal('pagination', pagination)
  njkEnv.addGlobal('sortHeader', sortHeader)
  njkEnv.addGlobal('monthOptions', monthOptions)
  njkEnv.addGlobal('yearOptions', yearOptions)

  njkEnv.addGlobal('ApplyUtils', ApplyUtils)
  njkEnv.addGlobal('AssessmentUtils', { ...AssessmentUtils, ...AssessmentTableUtils })
  njkEnv.addGlobal('ApplyUtils', ApplyUtils)
  njkEnv.addGlobal('OASysUtils', OASysUtils)
  njkEnv.addGlobal('OffenceUtils', OffenceUtils)
  njkEnv.addGlobal('AttachDocumentsUtils', AttachDocumentsUtils)
  njkEnv.addGlobal('OasysImportUtils', OasysImportUtils)
  njkEnv.addGlobal('CancellationUtils', CancellationUtils)
  njkEnv.addGlobal('TasklistUtils', TasklistUtils)
  njkEnv.addGlobal('FormUtils', FormUtils)
  njkEnv.addGlobal('UserUtils', UserUtils)
  njkEnv.addGlobal('TaskUtils', TaskUtils)
  njkEnv.addGlobal('PlacementRequestUtils', PlacementRequestUtils)
  njkEnv.addGlobal('SummaryListUtils', SummaryListUtils)
  njkEnv.addGlobal('BedUtils', BedUtils)
  njkEnv.addGlobal('OutOfServiceBedUtils', OutOfServiceBedUtils)
  njkEnv.addGlobal('PlacementApplicationUtils', PlacementApplicationUtils)
  njkEnv.addGlobal('PremisesUtils', PremisesUtils)
  njkEnv.addGlobal('PlacementUtils', PlacementUtils)
  njkEnv.addGlobal('ReportUtils', ReportUtils)
  njkEnv.addGlobal('AppealsUtils', AppealsUtils)

  njkEnv.addGlobal(
    'getDocumentSections',
    (submittedForm: Application | Assessment, assessmentId?: string) =>
      new SubmittedDocumentRenderer(submittedForm, assessmentId).response,
  )

  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

  njkEnv.addGlobal('feedbackSurveyUrl', 'https://forms.office.com/e/jSiRQFF82r')
  njkEnv.addGlobal(
    'serviceNowUrl',
    'https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=1ba4a5691b9f9a10a1e2ddf0b24bcbb1&recordUrl=com.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1&sysparm_id=1ba4a5691b9f9a10a1e2ddf0b24bcbb1',
  )
}
