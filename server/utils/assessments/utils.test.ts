import {
  acctAlertsFromAssessment,
  adjudicationsFromAssessment,
  allocatedTableRows,
  allocationLink,
  allocationSummary,
  arriveDateAsTimestamp,
  assessmentLink,
  assessmentSections,
  assessmentsApproachingDue,
  assessmentsApproachingDueBadge,
  awaitingAssessmentTableRows,
  caseNotesFromAssessment,
  completedTableRows,
  confirmationPageMessage,
  confirmationPageResult,
  daysSinceInfoRequest,
  daysSinceReceived,
  daysUntilDue,
  formatDays,
  formatDaysUntilDueWithWarning,
  formattedArrivalDate,
  getApplicationType,
  getPage,
  getReviewNavigationItems,
  getSectionSuffix,
  getStatus,
  getTaskResponsesAsSummaryListItems,
  groupAssessmements,
  rejectionRationaleFromAssessmentResponses,
  requestedFurtherInformationTableRows,
  unallocatedTableRows,
} from './utils'
import { DateFormats } from '../dateUtils'
import paths from '../../paths/assess'

import * as personUtils from '../personUtils'
import * as applicationUtils from '../applications/utils'

import Assess from '../../form-pages/assess'
import { UnknownPageError } from '../errors'
import assessmentFactory from '../../testutils/factories/assessment'
import applicationFactory from '../../testutils/factories/application'
import clarificationNoteFactory from '../../testutils/factories/clarificationNote'
import documentFactory from '../../testutils/factories/document'
import adjudicationFactory from '../../testutils/factories/adjudication'
import prisonCaseNotesFactory from '../../testutils/factories/prisonCaseNotes'
import acctAlertFactory from '../../testutils/factories/acctAlert'
import userFactory from '../../testutils/factories/user'
import reviewSections from '../reviewUtils'
import { documentsFromApplication } from './documentUtils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../applications/utils')
jest.mock('../checkYourAnswersUtils')
jest.mock('../personUtils')
jest.mock('../reviewUtils')
jest.mock('./documentUtils')
jest.mock('../applications/arrivalDateFromApplication')
jest.mock('./decisionUtils')

jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'review-application': {}, 'sufficient-information': {} },
    sections: [
      {
        title: 'Review Application',
        name: 'ReviewApplication',
      },
      {
        title: 'Assess Application',
        name: 'AssessApplication',
      },
    ],
  }
})

jest.mock('../../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'basic-information',
            title: 'Basic Information',
            pages: { 'basic-information': {}, 'type-of-ap': {} },
          },
        ],
      },
      {
        title: 'Second',
        tasks: [],
      },
    ],
  }
})

Assess.pages['review-application'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('groupAssessmements', () => {
    it('groups assessments by their status', () => {
      const completedAssessments = assessmentFactory.buildList(2, { status: 'completed' })
      const pendingAssessments = assessmentFactory.buildList(3, { status: 'pending' })
      const activeAssessments = assessmentFactory.buildList(5, { status: 'active' })

      const assessments = [completedAssessments, pendingAssessments, activeAssessments].flat()

      expect(groupAssessmements(assessments, 'status')).toEqual({
        completed: completedAssessments,
        requestedFurtherInformation: pendingAssessments,
        awaiting: activeAssessments,
      })
    })

    it('groups assessments by their allocation', () => {
      const allocatedAssessments = assessmentFactory.buildList(2, { allocatedToStaffMember: userFactory.build() })
      const unallocatedAssessments = assessmentFactory.buildList(3, { allocatedToStaffMember: null })

      const assessments = [allocatedAssessments, unallocatedAssessments].flat()

      expect(groupAssessmements(assessments, 'allocation')).toEqual({
        allocated: allocatedAssessments,
        unallocated: unallocatedAssessments,
      })
    })
  })

  describe('daysSinceReceived', () => {
    it('returns the difference in days since the assessment has been received', () => {
      const assessment = assessmentFactory.createdXDaysAgo(10).build()

      expect(daysSinceReceived(assessment)).toEqual(10)
    })
  })

  describe('daysSinceInfoRequest', () => {
    it('returns the difference in days since the assessment has been received', () => {
      const today = new Date()

      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4)
      const infoRequest = clarificationNoteFactory.build({ createdAt: DateFormats.dateObjToIsoDate(date) })
      const assessment = assessmentFactory.build({
        clarificationNotes: [clarificationNoteFactory.build(), infoRequest],
      })

      expect(daysSinceInfoRequest(assessment)).toEqual(4)
    })

    it('returns undefined if there are no info requests', () => {
      const assessment = assessmentFactory.build({ clarificationNotes: [] })

      expect(daysSinceInfoRequest(assessment)).toEqual(undefined)
    })
  })

  describe('formatDays', () => {
    it('returns the singular form if there is 1 day', () => {
      expect(formatDays(1)).toEqual('1 Day')
    })

    it('returns the plural form if there is more than 1 day', () => {
      expect(formatDays(22)).toEqual('22 Days')
    })

    it('returns N/A if the day in undefined', () => {
      expect(formatDays(undefined)).toEqual('N/A')
    })
  })

  describe('getStatus', () => {
    it('returns Not started for an active assessment without data', () => {
      const assessment = assessmentFactory.build({ status: 'active', data: undefined })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--grey">Not started</strong>')
    })

    it('returns In Progress for an an active assessment with data', () => {
      const assessment = assessmentFactory.build({ status: 'active' })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--blue">In progress</strong>')
    })

    describe('completed assessments', () => {
      it('returns "suitable" for an approved assessment assessment', () => {
        const assessment = assessmentFactory.build({ status: 'completed', decision: 'accepted' })

        expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--green">Suitable</strong>')
      })

      it('returns "rejected" for an approved assessment assessment', () => {
        const assessment = assessmentFactory.build({ status: 'completed', decision: 'rejected' })

        expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--red">Rejected</strong>')
      })
    })
  })

  describe('daysUntilDue', () => {
    it('returns the days until the assessment is due', () => {
      const assessment = assessmentFactory.createdXDaysAgo(2).build()

      expect(daysUntilDue(assessment)).toEqual(7)
    })
  })

  describe('formattedArrivalDate', () => {
    it('returns the formatted arrival date from the application', () => {
      const assessment = assessmentFactory.build()
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(formattedArrivalDate(assessment)).toEqual('1 Jan 2022')
      expect(arrivalDateFromApplication).toHaveBeenCalledWith(assessment.application)
    })
  })

  describe('arriveDateAsTimestamp', () => {
    it('returns the arrival date from the application as a unix timestamp', () => {
      const assessment = assessmentFactory.build()
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(arriveDateAsTimestamp(assessment)).toEqual(1640995200)
      expect(arrivalDateFromApplication).toHaveBeenCalledWith(assessment.application)
    })
  })

  describe('getApplicationType', () => {
    it('returns standard when the application is not PIPE', () => {
      const assessment = assessmentFactory.build({
        application: applicationFactory.build({ isPipeApplication: false }),
      })

      expect(getApplicationType(assessment)).toEqual('Standard')
    })

    it('returns PIPE when the application is PIPE', () => {
      const assessment = assessmentFactory.build({
        application: applicationFactory.build({ isPipeApplication: true }),
      })

      expect(getApplicationType(assessment)).toEqual('PIPE')
    })
  })

  describe('allocatedTableRows', () => {
    it('returns table rows for the assessments', () => {
      const staffMember = userFactory.build()
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: staffMember,
      })
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(allocatedTableRows([assessment])).toEqual([
        [
          { text: assessment.application.person.name },
          {
            text: formattedArrivalDate(assessment),
            attributes: {
              'data-sort-value': `${arriveDateAsTimestamp(assessment)}`,
            },
          },
          {
            html: formatDaysUntilDueWithWarning(assessment),
            attributes: {
              'data-sort-value': `${daysUntilDue(assessment)}`,
            },
          },
          { text: assessment.allocatedToStaffMember.name },
          { text: getApplicationType(assessment) },
          { html: getStatus(assessment) },
          { html: allocationLink(assessment, 'Reallocate') },
        ],
      ])
    })
  })

  describe('unallocatedTableRows', () => {
    it('returns table rows for the assessments', () => {
      const staffMember = userFactory.build()
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: staffMember,
      })
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(unallocatedTableRows([assessment])).toEqual([
        [
          { text: assessment.application.person.name },
          {
            text: formattedArrivalDate(assessment),
            attributes: {
              'data-sort-value': `${arriveDateAsTimestamp(assessment)}`,
            },
          },
          {
            html: formatDaysUntilDueWithWarning(assessment),
            attributes: {
              'data-sort-value': `${daysUntilDue(assessment)}`,
            },
          },
          { text: getApplicationType(assessment) },
          { html: getStatus(assessment) },
          { html: allocationLink(assessment, 'Allocate') },
        ],
      ])
    })
  })

  describe('awaitingAssessmentTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build()

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      const tierBadgeSpy = jest.spyOn(personUtils, 'tierBadge').mockReturnValue('TIER_BADGE')

      expect(awaitingAssessmentTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          { html: assessment.application.person.crn },
          { html: 'TIER_BADGE' },
          { text: formattedArrivalDate(assessment) },
          { text: assessment.application.person.prisonName },
          { html: formatDaysUntilDueWithWarning(assessment) },
          { html: getStatus(assessment) },
        ],
      ])

      expect(tierBadgeSpy).toHaveBeenCalledWith(assessment.application.risks.tier.value.level)
    })
  })

  describe('requestedInformationTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build({ clarificationNotes: clarificationNoteFactory.buildList(2) })

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      const tierBadgeSpy = jest.spyOn(personUtils, 'tierBadge').mockReturnValue('TIER_BADGE')

      expect(requestedFurtherInformationTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          { html: assessment.application.person.crn },
          { html: 'TIER_BADGE' },
          { text: formattedArrivalDate(assessment) },
          { text: formatDays(daysSinceReceived(assessment)) },
          { text: formatDays(daysSinceInfoRequest(assessment)) },
          { html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>` },
        ],
      ])

      expect(tierBadgeSpy).toHaveBeenCalledWith(assessment.application.risks.tier.value.level)
    })
  })

  describe('completedTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build()

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      const tierBadgeSpy = jest.spyOn(personUtils, 'tierBadge').mockReturnValue('TIER_BADGE')

      expect(completedTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          { html: assessment.application.person.crn },
          { html: 'TIER_BADGE' },
          { text: formattedArrivalDate(assessment) },
          { html: getStatus(assessment) },
        ],
      ])

      expect(tierBadgeSpy).toHaveBeenCalledWith(assessment.application.risks.tier.value.level)
    })
  })

  describe('assessmentsApproachingDue', () => {
    it('returns the number of assessments where the due date is less than DUE_DATE_APPROACHING_WINDOW away', () => {
      const assessments = [
        assessmentFactory.createdXDaysAgo(1).build(),
        assessmentFactory.createdXDaysAgo(2).build(),
        assessmentFactory.createdXDaysAgo(9).build(),
        assessmentFactory.createdXDaysAgo(7).build(),
      ]

      expect(assessmentsApproachingDue(assessments)).toEqual(2)
    })
  })

  describe('assessmentsApproachingDueBadge', () => {
    it('returns blank when there are no assessments approaching the due date', () => {
      const assessments = assessmentFactory.buildList(2, {
        createdAt: DateFormats.dateObjToIsoDate(new Date()),
      })

      expect(assessmentsApproachingDueBadge(assessments)).toEqual('')
    })

    it('returns a badge when there are assessments approaching the due date', () => {
      const assessments = assessmentFactory.createdXDaysAgo(9).buildList(2)

      expect(assessmentsApproachingDueBadge(assessments)).toEqual(
        '<span id="notifications" class="moj-notification-badge">2<span class="govuk-visually-hidden"> assessments approaching due date</span></span>',
      )
    })
  })

  describe('formatDaysUntilDueWithWarning', () => {
    it('returns the number of days without a warning if the due date is not soon', () => {
      const assessment = assessmentFactory.build({
        createdAt: DateFormats.dateObjToIsoDate(new Date()),
      })

      expect(formatDaysUntilDueWithWarning(assessment)).toEqual('9 Days')
    })

    it('returns the number of days with a warning if the due date is soon', () => {
      const assessment = assessmentFactory.createdXDaysAgo(8).build()

      expect(formatDaysUntilDueWithWarning(assessment)).toEqual(
        '<strong class="assessments--index__warning">1 Day<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>',
      )
    })
  })

  describe('assessmentLink', () => {
    const assessment = assessmentFactory.build({ id: '123', application: { person: { name: 'John Wayne' } } })

    it('returns a link to an assessment', () => {
      expect(assessmentLink(assessment)).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({ id: '123' })}" data-cy-assessmentId="123">John Wayne</a>
      `)
    })

    it('allows custom text to be specified', () => {
      expect(assessmentLink(assessment, 'My Text')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({ id: '123' })}" data-cy-assessmentId="123">My Text</a>
      `)
    })

    it('allows custom text and hidden text to be specified', () => {
      expect(assessmentLink(assessment, 'My Text', 'and some hidden text')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({
          id: '123',
        })}" data-cy-assessmentId="123">My Text <span class="govuk-visually-hidden">and some hidden text</span></a>
      `)
    })
  })

  describe('allocationLink', () => {
    const assessment = assessmentFactory.build({ application: { id: '123', person: { name: 'John Wayne' } } })

    it('returns a link to an allocation', () => {
      expect(allocationLink(assessment, 'Allocate')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.allocations.show({
          id: '123',
        })}" data-cy-assessmentId="${
        assessment.id
      }">Allocate <span class="govuk-visually-hidden">assessment for John Wayne</span></a>
      `)
    })
  })

  describe('getPage', () => {
    it('should return a page if it exists', () => {
      expect(getPage('review-application', 'first')).toEqual(FirstPage)
      expect(getPage('review-application', 'second')).toEqual(SecondPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('review-application', 'bar')
      }).toThrow(UnknownPageError)
    })
  })

  describe('assessmentSections', () => {
    it('calls reviewSections with the supplied arguments', () => {
      const application = applicationFactory.build()

      assessmentSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, getTaskResponsesAsSummaryListItems)
    })
  })

  describe('getTaskResponsesAsSummaryListItems', () => {
    it('returns an empty array if there isnt any responses for the task', () => {
      const application = applicationFactory.build()

      expect(getTaskResponsesAsSummaryListItems({ id: '42', title: '42', pages: {} }, application)).toEqual([])
    })

    it('returns the task responses as Summary List items', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(applicationUtils.getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(getTaskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application)).toEqual([
        {
          key: {
            text: 'title',
          },
          value: {
            text: 'response',
          },
        },
      ])
    })

    describe('if the page name includes "attach-documents"', () => {
      it('then the correct array is returned', () => {
        const application = applicationFactory.build()
        const documents = documentFactory.buildList(1)

        ;(documentsFromApplication as jest.Mock).mockReturnValue(documents)

        application.data['attach-required-documents'] = {
          'attach-documents': {
            selectedDocuments: documents,
          },
        }

        expect(
          getTaskResponsesAsSummaryListItems({ id: 'attach-required-documents', title: 'bar', pages: {} }, application),
        ).toEqual([
          {
            key: {
              html: `<a href="/applications/people/${application.person.crn}/documents/${documents[0].id}" data-cy-documentId="${documents[0].id}" />${documents[0].fileName}</a>`,
            },
            value: {
              text: documents[0].description,
            },
          },
        ])
      })
    })
  })

  describe('getReviewNavigationItems', () => {
    it('returns an array of objects with the link and human readable text for each of the Apply pages', () => {
      expect(getReviewNavigationItems()).toEqual([{ href: '#first', text: 'First' }])
    })
  })

  describe('getSectionSuffix', () => {
    const id = 'id'
    it('returns an empty string if the task id isnt oasys-import or prison-information', () => {
      expect(getSectionSuffix({ id: 'foo', title: '', pages: {} }, id)).toBe('')
    })

    it('returns the correct html if supplied a task with an ID of oasys-import', () => {
      expect(getSectionSuffix({ id: 'oasys-import', title: '', pages: {} }, id)).toBe(
        `<p><a href="${paths.assessments.supportingInformationPath({
          id,
          category: 'risk-information',
        })}">View detailed risk information</a></p>`,
      )
    })

    it('returns the correct html if supplied a task with an ID of prison-information', () => {
      expect(getSectionSuffix({ id: 'prison-information', title: '', pages: {} }, id)).toBe(
        `<p><a href="${paths.assessments.supportingInformationPath({
          id,
          category: 'prison-information',
        })}">View additional prison information</a></p>`,
      )
    })
  })

  describe('confirmationPageMessage', () => {
    const assessment = assessmentFactory.build()

    it('returns the release date copy if the decision is "releaseDate"', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('releaseDate')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've notified the Probation Practitioner that this application has been assessed as suitable.</p>
      <p>The assessment can now be used to match Robert Brown to a bed in an Approved Premises.</p>`)
    })

    it('returns the hold copy if the decision is "hold"', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('hold')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've notified the Probation Practitioner that this application has been assessed as suitable.</p>
        <p>This case is now paused until the oral hearing outcome has been provided by the Probation Practitioner and a release date is confirmed.</p>
        <p>It will be added to the matching queue if the oral hearing is successful.</p>`)
    })

    it('returns the rejection copy if the decision isnt "hold" or "releaseDate" ', () => {
      ;(decisionFromAssessment as jest.Mock).mockReturnValue('')

      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've sent you a confirmation email.</p>
        <p>We've notified the Probation Practitioner that this application has been rejected as unsuitable for an Approved Premises.</p>`)
    })
  })

  describe('confirmationPageResult', () => {
    const assessment = assessmentFactory.build()

    it('returns suitable copy if the application has been accepted"', () => {
      ;(applicationAccepted as jest.Mock).mockReturnValue(true)

      expect(confirmationPageResult(assessment)).toBe('You have marked this application as suitable.')
    })

    it('returns suitable copy if the application has not been accepted"', () => {
      ;(applicationAccepted as jest.Mock).mockReturnValue(false)

      expect(confirmationPageResult(assessment)).toBe('You have marked this application as unsuitable.')
    })
  })

  describe('adjudicationsFromAssessment', () => {
    it('returns the adjudications from the assessment', () => {
      const adjudications = adjudicationFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = { 'case-notes': { adjudications } }

      expect(adjudicationsFromAssessment(assessment)).toEqual(adjudications)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = {}

      expect(adjudicationsFromAssessment(assessment)).toEqual([])
    })
  })

  describe('caseNotesFromAssessment', () => {
    it('returns the caseNotes from the assessment', () => {
      const selectedCaseNotes = prisonCaseNotesFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = { 'case-notes': { selectedCaseNotes } }

      expect(caseNotesFromAssessment(assessment)).toEqual(selectedCaseNotes)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = {}

      expect(caseNotesFromAssessment(assessment)).toEqual([])
    })
  })

  describe('acctAlertsFromAssessment', () => {
    it('returns the acctAlerts from the assessment', () => {
      const acctAlerts = acctAlertFactory.buildList(2)
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = { 'case-notes': { acctAlerts } }

      expect(acctAlertsFromAssessment(assessment)).toEqual(acctAlerts)
    })

    it('returns an empty string if the case notes are empty', () => {
      const assessment = assessmentFactory.build()
      assessment.application.data['prison-information'] = {}

      expect(acctAlertsFromAssessment(assessment)).toEqual([])
    })
  })

  describe('allocationSummary', () => {
    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')
    })

    it('returns the summary list when the assessment has a staff member allocated', () => {
      const staffMember = userFactory.build()
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: staffMember,
      })

      expect(allocationSummary(assessment)).toEqual([
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: assessment.application.person.crn,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: formattedArrivalDate(assessment),
          },
        },
        {
          key: {
            text: 'Application Type',
          },
          value: {
            text: getApplicationType(assessment),
          },
        },
        {
          key: {
            text: 'Allocated To',
          },
          value: {
            text: assessment.allocatedToStaffMember.name,
          },
        },
      ])
    })

    it('returns the summary list when the assessment does not have a staff member allocated', () => {
      const assessment = assessmentFactory.build({
        allocatedToStaffMember: null,
      })

      expect(allocationSummary(assessment)).toEqual([
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: assessment.application.person.crn,
          },
        },
        {
          key: {
            text: 'Arrival date',
          },
          value: {
            text: formattedArrivalDate(assessment),
          },
        },
        {
          key: {
            text: 'Application Type',
          },
          value: {
            text: getApplicationType(assessment),
          },
        },
      ])
    })
  })

  describe('rejectionRationaleFromAssessmentResponses', () => {
    it('returns the rejectionRationale from the assessment when it exists', () => {
      const assessment = assessmentFactory.build()

      ;(applicationUtils.getResponseForPage as jest.Mock).mockImplementation(() => ({ Decision: 'some rationale' }))

      expect(rejectionRationaleFromAssessmentResponses(assessment)).toEqual('some rationale')
    })

    it('returns an empty string when the rationale doesnt exists', () => {
      const assessment = assessmentFactory.build()

      expect(rejectionRationaleFromAssessmentResponses(assessment)).toEqual('')
    })
  })
})
