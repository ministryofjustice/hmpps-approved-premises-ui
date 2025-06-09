import { ApplicationSortField, SortDirection } from '../../@types/shared'
import { cas1ApplicationSummaryFactory } from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'
import {
  pendingPlacementRequestTableHeader,
  pendingPlacementRequestTableRows,
  releaseTypeSelectOptions,
} from './pendingPlacementRequestTable'
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
            sortHeader<ApplicationSortField>('Release Type', 'releaseType', sortField, sortDirection, hrefPrefix),
          ])
        },
      )
    })
  })

  describe('pendingPlacementRequestTableRows', () => {
    it('returns a list of rows for application summaries', () => {
      const summaries = [
        cas1ApplicationSummaryFactory.build(),
        cas1ApplicationSummaryFactory.build({ releaseType: undefined }),
      ]

      expect(pendingPlacementRequestTableRows(summaries)).toEqual([
        [
          createNameAnchorElement(summaries[0].person, summaries[0], { showCrn: true }),
          htmlValue(getTierOrBlank(summaries[0].risks?.tier?.value?.level)),
          textValue(DateFormats.isoDateToUIDate(summaries[0].createdAt, { format: 'short' })),
          textValue(allReleaseTypes[summaries[0].releaseType]),
        ],
        [
          createNameAnchorElement(summaries[1].person, summaries[1], { showCrn: true }),
          htmlValue(getTierOrBlank(summaries[1].risks?.tier?.value?.level)),
          textValue(DateFormats.isoDateToUIDate(summaries[1].createdAt, { format: 'short' })),
          textValue(''),
        ],
      ])
    })
  })

  describe('releaseTypeSelectOptions', () => {
    it('should return select options for release type with the all release types option selected by default', () => {
      expect(releaseTypeSelectOptions(null)).toEqual([
        { selected: true, text: 'All release types', value: '' },
        { selected: false, text: 'Licence', value: 'licence' },
        { selected: false, text: 'Release on Temporary Licence (ROTL)', value: 'rotl' },
        { selected: false, text: 'Home detention curfew (HDC)', value: 'hdc' },
        { selected: false, text: 'Post Sentence Supervision (PSS)', value: 'pss' },
        { selected: false, text: 'In Community', value: 'in_community' },
        { selected: false, text: 'Not Applicable', value: 'not_applicable' },
        { selected: false, text: 'Licence (Extended Determinate sentence)', value: 'extendedDeterminateLicence' },
        { selected: false, text: 'Licence (Parole directed)', value: 'paroleDirectedLicence' },
        { selected: false, text: 'Re-released post recall', value: 'reReleasedPostRecall' },
      ])
    })
  })
})
