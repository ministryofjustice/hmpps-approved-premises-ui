import { add } from 'date-fns'
import placementRequestFactory from '../../testutils/factories/placementRequest'
import { DateFormats } from '../dateUtils'
import { linkCell, mentalHealthSupportCell, placementCriteriaClasses, tableRows } from './table'
import { sentenceCase } from '../utils'

describe('placementRequestUtils', () => {
  describe('tableRows', () => {
    it('returns the table rows', () => {
      const placementRequests = placementRequestFactory.buildList(1)

      expect(tableRows(placementRequests)).toEqual([
        [
          { text: placementRequests[0].person.name },
          { text: placementRequests[0].person.crn },
          {
            text: DateFormats.differenceInDays(
              DateFormats.isoToDateObj(placementRequests[0].expectedArrival),
              add(DateFormats.isoToDateObj(placementRequests[0].expectedArrival), { days: 7 }),
            ).ui,
          },
          { text: DateFormats.isoDateToUIDate(placementRequests[0].expectedArrival) },
          { text: placementRequests[0].location },
          {
            html: `<ul class=${placementCriteriaClasses}>${placementRequests[0].essentialCriteria
              .map(placementNeed => `<li>${sentenceCase(placementNeed)}</li>`)
              .join('')}</ul>`,
          },
          {
            html: `<ul class=${placementCriteriaClasses}>${placementRequests[0].desirableCriteria
              .map(placementNeed => `<li>${sentenceCase(placementNeed)}</li>`)
              .join('')}</ul>`,
          },
          linkCell(placementRequests[0]),
        ],
      ])
    })
  })

  describe('mentalHealthSupportCell', () => {
    it('returns Yes if the value is true', () => {
      const placementRequest = placementRequestFactory.build({ mentalHealthSupport: true })

      expect(mentalHealthSupportCell(placementRequest)).toEqual({ text: 'Yes' })
    })
    it('returns No if the value is false', () => {
      const placementRequest = placementRequestFactory.build({ mentalHealthSupport: false })

      expect(mentalHealthSupportCell(placementRequest)).toEqual({ text: 'No' })
    })
  })
})
