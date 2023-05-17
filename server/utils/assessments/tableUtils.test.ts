import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'

import * as personUtils from '../personUtils'
import { assessmentFactory, clarificationNoteFactory } from '../../testutils/factories'
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

jest.mock('../applications/arrivalDateFromApplication')
jest.mock('../personUtils')

describe('tableUtils', () => {
  describe('getStatus', () => {
    it('returns Not started for an active assessment without data', () => {
      const assessment = assessmentFactory.build({ status: 'not_started', data: undefined })

      expect(getStatus(assessment)).toEqual('<strong class="govuk-tag govuk-tag--grey">Not started</strong>')
    })

    it('returns In Progress for an an active assessment with data', () => {
      const assessment = assessmentFactory.build({ status: 'in_progress' })

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
})
