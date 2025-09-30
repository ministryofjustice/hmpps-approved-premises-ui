import { OffenderFullDto, ProjectAllocationsDto } from '../@types/shared'
import paths from '../paths'
import DateFormats from './dateUtils'
import HtmlUtils from './hmtlUtils'
import SessionUtils from './sessionUtils'
import { createQueryString } from './utils'

describe('SessionUtils', () => {
  describe('sessionResultTableRows', () => {
    const fakeFormattedDate = '20 January 2026'
    const fakeFormattedTime = '12:00'
    const fakeElement = '<div>project</div>'
    const fakeLink = '<a>link</a>'

    beforeEach(() => {
      jest.spyOn(DateFormats, 'isoDateToUIDate').mockReturnValue(fakeFormattedDate)
      jest.spyOn(DateFormats, 'stripTime').mockReturnValue(fakeFormattedTime)
      jest.spyOn(HtmlUtils, 'getElementWithContent').mockReturnValue(fakeElement)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
    })

    it('returns session results formatted into expected table rows', () => {
      const allocation = {
        id: 1001,
        projectId: 3,
        date: '2025-09-07',
        projectName: 'project-name',
        projectCode: 'prj',
        startTime: '09:00',
        endTime: '17:00',
        numberOfOffendersAllocated: 5,
        numberOfOffendersWithOutcomes: 3,
        numberOfOffendersWithEA: 1,
      }

      const sessions: ProjectAllocationsDto = {
        allocations: [allocation],
      }

      const result = SessionUtils.sessionResultTableRows(sessions)

      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        allocation.projectName,
        `${paths.sessions.show({ id: allocation.projectId.toString() })}?${createQueryString({ date: allocation.date })}`,
      )

      expect(HtmlUtils.getElementWithContent).toHaveBeenNthCalledWith(1, fakeLink)
      expect(HtmlUtils.getElementWithContent).toHaveBeenNthCalledWith(2, allocation.projectCode)

      expect(result).toEqual([
        [
          { html: fakeElement + fakeElement },
          { text: fakeFormattedDate },
          { text: fakeFormattedTime },
          { text: fakeFormattedTime },
          { text: allocation.numberOfOffendersAllocated },
          { text: allocation.numberOfOffendersWithOutcomes },
          { text: allocation.numberOfOffendersWithEA },
        ],
      ])
    })
  })

  describe('sessionListTableRows', () => {
    it('returns session formatted into expected table rows', () => {
      const mockTag = '<strong>Status</strong>'
      jest.spyOn(HtmlUtils, 'getStatusTag').mockReturnValue(mockTag)
      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        objectType: 'Full',
      }

      const session = {
        appointments: [
          {
            id: 1,
            projectName: 'Community garden',
            offender,
            requirementMinutes: 120,
            completedMinutes: 60,
          },
        ],
      }

      const result = SessionUtils.sessionListTableRows(session)

      expect(result).toEqual([
        [{ text: 'Sam Smith' }, { text: 'CRN123' }, { text: 2 }, { text: 1 }, { text: 1 }, { html: mockTag }],
      ])
    })
  })
})
