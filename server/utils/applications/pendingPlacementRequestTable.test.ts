import { ApplicationSortField, SortDirection } from '../../@types/shared'
import { applicationSummaryFactory } from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'
import { pendingPlacementRequestTableHeader, pendingPlacementRequestTableRows } from './pendingPlacementRequestTable'
import { allReleaseTypes } from './releaseTypeUtils'
import { createNameAnchorElement, getTierOrBlank, htmlValue, textValue } from './helpers'

describe('pendingPlacementRequestTable', () => {
  describe('pendingPlacementRequestTableHeader', () => {
    const sortFields: Record<ApplicationSortField, undefined> = {
      tier: undefined,
      createdAt: undefined,
      arrivalDate: undefined,
      releaseType: undefined,
    }
    const hrefPrefix = 'http://example.com'

    describe.each(['asc', 'desc'])('when sortDirection is %s', (sortDirection: SortDirection) => {
      it.each(Object.keys(sortFields))(
        'returns the header with the sort field %s set',
        (sortField: ApplicationSortField) => {
          expect(pendingPlacementRequestTableHeader(sortField, sortDirection, hrefPrefix)).toEqual([
            {
              text: 'Name',
            },
            sortHeader<ApplicationSortField>('Tier', 'tier', sortField, sortDirection, hrefPrefix),
            sortHeader<ApplicationSortField>('Date of application', 'createdAt', sortField, sortDirection, hrefPrefix),
            {
              text: 'Release Type',
            },
          ])
        },
      )
    })
  })

  describe('pendingPlacementRequestTableRows', () => {
    it('returns a list of rows for application summaries', () => {
      const summaries = [applicationSummaryFactory.build(), applicationSummaryFactory.build({ releaseType: undefined })]

      expect(pendingPlacementRequestTableRows(summaries)).toEqual([
        [
          createNameAnchorElement(summaries[0].person, summaries[0]),
          htmlValue(getTierOrBlank(summaries[0].risks?.tier?.value?.level)),
          textValue(DateFormats.isoDateToUIDate(summaries[0].createdAt, { format: 'short' })),
          textValue(allReleaseTypes[summaries[0].releaseType]),
        ],
        [
          createNameAnchorElement(summaries[1].person, summaries[1]),
          htmlValue(getTierOrBlank(summaries[1].risks?.tier?.value?.level)),
          textValue(DateFormats.isoDateToUIDate(summaries[1].createdAt, { format: 'short' })),
          textValue(''),
        ],
      ])
    })
  })
})
