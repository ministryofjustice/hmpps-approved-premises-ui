import {
  applicationAccepted,
  daysSinceReceived,
  getStatus,
  formattedArrivalDate,
  awaitingAssessmentTableRows,
  formatDays,
  daysUntilDue,
  daysSinceInfoRequest,
  requestedFurtherInformationTableRows,
  completedTableRows,
  assessmentsApproachingDue,
  assessmentsApproachingDueBadge,
  formatDaysUntilDueWithWarning,
  assessmentLink,
  getPage,
  assessmentSections,
  getTaskResponsesAsSummaryListItems,
  getReviewNavigationItems,
  getSectionSuffix,
  decisionFromAssessment,
  confirmationPageMessage,
  confirmationPageResult,
  adjudicationsFromAssessment,
  caseNotesFromAssessment,
  acctAlertsFromAssessment,
  groupAssessmements,
} from './utils'
import { DateFormats } from '../dateUtils'
import paths from '../../paths/assess'

import * as personUtils from '../personUtils'
import * as applicationUtils from '../applicationUtils'

import Assess from '../../form-pages/assess'
import { UnknownPageError } from '../errors'
import assessmentFactory from '../../testutils/factories/assessment'
import applicationFactory from '../../testutils/factories/application'
import clarificationNoteFactory from '../../testutils/factories/clarificationNote'
import documentFactory from '../../testutils/factories/document'
import adjudicationFactory from '../../testutils/factories/adjudication'
import prisonCaseNotesFactory from '../../testutils/factories/prisonCaseNotes'
import acctAlertFactory from '../../testutils/factories/acctAlert'
import reviewSections from '../reviewUtils'
import { documentsFromApplication } from './documentUtils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../applicationUtils')
jest.mock('../checkYourAnswersUtils')
jest.mock('../personUtils')
jest.mock('../reviewUtils')
jest.mock('./documentUtils')

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

    it('returns Completed for a completed assessment', () => {
      const assessment = assessmentFactory.build({ status: 'completed' })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag">Completed</strong>')
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
      const getDateSpy = jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

      expect(formattedArrivalDate(assessment)).toEqual('1 Jan 2022')
      expect(getDateSpy).toHaveBeenCalledWith(assessment.application)
    })
  })

  describe('awaitingAssessmentTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentFactory.build()

      jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

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

      jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

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

      jest.spyOn(applicationUtils, 'getArrivalDate').mockReturnValue('2022-01-01')

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
        '<p><a href="oasys-link">View detailed risk information</a></p>',
      )
    })

    it('returns the correct html if supplied a task with an ID of prison-information', () => {
      expect(getSectionSuffix({ id: 'prison-information', title: '', pages: {} }, id)).toBe(
        '<p><a href="/assessments/id/prison-information">View additional prison information</a></p>',
      )
    })
  })

  describe('decisionFromAssessment', () => {
    it('returns the decision from the assessment if it exists', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'the decision' } } },
      })
      expect(decisionFromAssessment(assessment)).toEqual('the decision')
    })

    it('returns an empty string of the decision doesnt exist', () => {
      const assessment = assessmentFactory.build({ data: {} })
      expect(decisionFromAssessment(assessment)).toEqual('')
    })
  })

  describe('applicationAccepted', () => {
    it('returns true if the assessment has either of the two decisions which accept an applicaiton', () => {
      const acceptedAssessment1 = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
      })
      const acceptedAssessment2 = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
      })

      expect(applicationAccepted(acceptedAssessment1)).toBe(true)
      expect(applicationAccepted(acceptedAssessment2)).toBe(true)
    })

    it('returns false if the assessment has any other decision', () => {
      const rejectedAssessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'reject' } } },
      })

      expect(applicationAccepted(rejectedAssessment)).toBe(false)
    })

    it('returns false if the assessment has no decision', () => {
      const rejectedAssessment = assessmentFactory.build()

      expect(applicationAccepted(rejectedAssessment)).toBe(false)
    })
  })

  describe('confirmationPageMessage', () => {
    it('returns the release date copy if the decision is "releaseDate"', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
      })
      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've notified the Probation Practitioner that this application has been assessed as suitable.</p>
      <p>The assessment can now be used to match Robert Brown to a bed in an Approved Premises.</p>`)
    })

    it('returns the hold copy if the decision is "hold"', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'hold' } } },
      })
      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've notified the Probation Practitioner that this application has been assessed as suitable.</p>
        <p>This case is now paused until the oral hearing outcome has been provided by the Probation Practitioner and a release date is confirmed.</p>
        <p>It will be added to the matching queue if the oral hearing is successful.</p>`)
    })

    it('returns the rejection copy if the decision isnt "hold" or "releaseDate" ', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: '' } } },
      })
      expect(confirmationPageMessage(assessment))
        .toMatchStringIgnoringWhitespace(`<p>We've sent you a confirmation email.</p>
        <p>We've notified the Probation Practitioner that this application has been rejected as unsuitable for an Approved Premises.</p>`)
    })
  })

  describe('confirmationPageResult', () => {
    it('returns the release date copy if the decision is "releaseDate"', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'releaseDate' } } },
      })
      expect(confirmationPageResult(assessment)).toBe('You have marked this application as suitable.')
    })

    it('returns the hold copy if the decision is "hold"', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: 'hold' } } },
      })
      expect(confirmationPageResult(assessment)).toBe('You have marked this application as suitable.')
    })

    it('returns the rejection copy if the decision isnt "hold" or "releaseDate" ', () => {
      const assessment = assessmentFactory.build({
        data: { 'make-a-decision': { 'make-a-decision': { decision: '' } } },
      })
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
})
