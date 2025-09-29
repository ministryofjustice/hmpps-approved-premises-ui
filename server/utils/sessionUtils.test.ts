import { OffenderFullDto } from "../@types/shared"
import HtmlUtils from "./hmtlUtils"
import SessionUtils from "./sessionUtils"

describe('SessionUtils', () => {
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

      var result = SessionUtils.sessionListTableRows(session)

      expect(result).toEqual([[
        { text: 'Sam Smith' },
        { text: 'CRN123' },
        { text: 2 },
        { text: 1 },
        { text: 1 },
        { html: mockTag }
      ]])
    })
  })
})
