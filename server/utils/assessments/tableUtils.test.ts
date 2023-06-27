import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'

import { assessmentSummaryFactory } from '../../testutils/factories'
import {
  daysSinceInfoRequest,
  daysSinceReceived,
  formatDays,
  formatDaysUntilDueWithWarning,
  formattedArrivalDate,
} from './dateUtils'
import {
  assessmentLink,
  awaitingAssessmentTableRows,
  completedTableRows,
  getStatus,
  requestedFurtherInformationTableRows,
} from './tableUtils'
import paths from '../../paths/assess'
import { crnCell, tierCell } from '../tableUtils'

jest.mock('../applications/arrivalDateFromApplication')

describe('tableUtils', () => {
  describe('getStatus', () => {
    it('returns Not started for an assessment that has not been started', () => {
      const assessment = assessmentSummaryFactory.build({ status: 'not_started' })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--grey">Not started</strong>')
    })

    it('returns In Progress for an an in progress assessment', () => {
      const assessment = assessmentSummaryFactory.build({ status: 'in_progress' })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--blue">In progress</strong>')
    })

    describe('completed assessments', () => {
      it('returns "suitable" for an approved assessment assessment', () => {
        const assessment = assessmentSummaryFactory.build({ status: 'completed', decision: 'accepted' })

        expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--green">Suitable</strong>')
      })

      it('returns "rejected" for an approved assessment assessment', () => {
        const assessment = assessmentSummaryFactory.build({ status: 'completed', decision: 'rejected' })

        expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--red">Rejected</strong>')
      })
    })
  })

  describe('assessmentLink', () => {
    const assessment = assessmentSummaryFactory.build({
      id: '123',
      applicationId: '345',
      person: { name: 'John Wayne' },
    })

    it('returns a link to an assessment', () => {
      expect(assessmentLink(assessment)).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({
          id: '123',
        })}" data-cy-assessmentId="123" data-cy-applicationId="345">John Wayne</a>
      `)
    })

    it('allows custom text to be specified', () => {
      expect(assessmentLink(assessment, 'My Text')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({
          id: '123',
        })}" data-cy-assessmentId="123" data-cy-applicationId="345">My Text</a>
      `)
    })

    it('allows custom text and hidden text to be specified', () => {
      expect(assessmentLink(assessment, 'My Text', 'and some hidden text')).toMatchStringIgnoringWhitespace(`
        <a href="${paths.assessments.show({
          id: '123',
        })}" data-cy-assessmentId="123" data-cy-applicationId="345">My Text <span class="govuk-visually-hidden">and some hidden text</span></a>
      `)
    })
  })

  describe('awaitingAssessmentTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentSummaryFactory.build()

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(awaitingAssessmentTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          crnCell({ crn: assessment.person.crn }),
          tierCell({ tier: assessment.risks.tier }),
          { text: formattedArrivalDate(assessment) },
          { text: assessment.person.prisonName },
          { html: formatDaysUntilDueWithWarning(assessment) },
          { html: getStatus(assessment) },
        ],
      ])
    })
  })

  describe('requestedInformationTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentSummaryFactory.build({ status: 'awaiting_response' })

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(requestedFurtherInformationTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          crnCell({ crn: assessment.person.crn }),
          tierCell({ tier: assessment.risks.tier }),
          { text: formattedArrivalDate(assessment) },
          { text: formatDays(daysSinceReceived(assessment)) },
          { text: formatDays(daysSinceInfoRequest(assessment)) },
          { html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>` },
        ],
      ])
    })
  })

  describe('completedTableRows', () => {
    it('returns table rows for the assessments', () => {
      const assessment = assessmentSummaryFactory.build()

      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

      expect(completedTableRows([assessment])).toEqual([
        [
          { html: assessmentLink(assessment) },
          crnCell({ crn: assessment.person.crn }),
          tierCell({ tier: assessment.risks.tier }),
          { text: formattedArrivalDate(assessment) },
          { html: getStatus(assessment) },
        ],
      ])
    })
  })
})
