import { placementApplicationTaskFactory } from '../../testutils/factories'
import { nameCell, placementTypeCell, statusCell, tableRows } from './table'
import { crnCell, tierCell } from '../tableUtils'
import { linkTo, sentenceCase } from '../utils'
import paths from '../../paths/placementApplications'

jest.mock('../utils')

describe('table', () => {
  const stubLink = 'LINK'
  const stubSentenceCase = 'SENTENCE_CASE'

  beforeEach(() => {
    jest.mocked(linkTo).mockReturnValue(stubLink)
    jest.mocked(sentenceCase).mockReturnValue(stubSentenceCase)
  })

  describe('nameCell', () => {
    it('returns the name of the service user and a link', () => {
      const task = placementApplicationTaskFactory.build()

      nameCell(task)

      expect(linkTo).toHaveBeenCalledWith(
        paths.placementApplications.review.show,
        { id: task.id },
        {
          text: task.personName,
          attributes: { 'data-cy-placementApplicationId': task.id, 'data-cy-applicationId': task.applicationId },
        },
      )
    })
  })

  describe('placementTypeCell', () => {
    it('returns the correct placement type', () => {
      const task = placementApplicationTaskFactory.build({ placementType: 'rotl' })

      expect(placementTypeCell(task)).toEqual({ text: 'ROTL' })
    })
  })

  describe('statusCell', () => {
    it('returns the correct placement type', () => {
      const task = placementApplicationTaskFactory.build({ status: 'complete' })

      expect(statusCell(task)).toEqual({ html: `<strong class="govuk-tag">${stubSentenceCase}</strong>` })
      expect(sentenceCase).toHaveBeenCalledWith(task.status)
    })
  })

  describe('tableRows', () => {
    it('returns the correct table rows', () => {
      const tasks = placementApplicationTaskFactory.buildList(1)

      expect(tableRows(tasks)).toEqual([
        [
          {
            html: stubLink,
          },
          crnCell(tasks[0]),
          tierCell(tasks[0]),
          placementTypeCell(tasks[0]),
          statusCell(tasks[0]),
        ],
      ])
      expect(linkTo).toHaveBeenCalledWith(
        paths.placementApplications.review.show,
        { id: tasks[0].id },
        {
          text: tasks[0].personName,
          attributes: {
            'data-cy-placementApplicationId': tasks[0].id,
            'data-cy-applicationId': tasks[0].applicationId,
          },
        },
      )
    })
  })
})
