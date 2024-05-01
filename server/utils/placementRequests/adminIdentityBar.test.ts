import { personFactory, placementRequestDetailFactory, restrictedPersonFactory } from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import managePaths from '../../paths/manage'
import adminPaths from '../../paths/admin'
import applyPaths from '../../paths/apply'
import { nameOrPlaceholderCopy } from '../personUtils'
import { fullPersonFactory } from '../../testutils/factories/person'

describe('adminIdentityBar', () => {
  describe('adminActions', () => {
    it('should return actions to amend a booking if the status is `matched`', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ status: 'matched' })

      expect(adminActions(placementRequestDetail)).toEqual([
        {
          href: managePaths.bookings.dateChanges.new({
            premisesId: placementRequestDetail.booking?.premisesId || '',
            bookingId: placementRequestDetail.booking?.id || '',
          }),
          text: 'Amend placement',
        },
        {
          href: applyPaths.applications.withdraw.new({ id: placementRequestDetail.applicationId }),
          text: 'Withdraw placement',
        },
      ])
    })

    it('should return actions to create a booking and withdraw a placement request if the status is not `matched`', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ status: 'notMatched' })

      expect(adminActions(placementRequestDetail)).toEqual([
        {
          href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequestDetail.id }),
          text: 'Create placement',
        },
        {
          href: applyPaths.applications.withdraw.new({ id: placementRequestDetail.applicationId }),
          text: 'Withdraw request for placement',
        },
        {
          href: adminPaths.admin.placementRequests.unableToMatch.new({ id: placementRequestDetail.id }),
          text: 'Mark as unable to match',
        },
      ])
    })
  })

  describe('title', () => {
    it('should return HTML for the title', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ person: personFactory.build() })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l">${nameOrPlaceholderCopy(placementRequestDetail.person)}</h1>
      `)
    })

    it('should return Limited Access Offender if the person has no name', () => {
      const placementRequestDetailWithRestrictedAccessOffender = placementRequestDetailFactory.build()
      placementRequestDetailWithRestrictedAccessOffender.person = restrictedPersonFactory.build()

      expect(title(placementRequestDetailWithRestrictedAccessOffender)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l">Limited Access Offender</h1>
      `)
    })

    it('should return a withdrawn tag if the request for placement has been withdrawn', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({
        isWithdrawn: true,
        person: fullPersonFactory.build(),
      })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
<span class="govuk-caption-l">Placement request</span>
<h1 class="govuk-heading-l">
${nameOrPlaceholderCopy(placementRequestDetail.person)}
<strong class="govuk-tag govuk-tag--red govuk-!-margin-5">Request for placement withdrawn</strong>
</h1>
      `)
    })
  })

  describe('adminIdentityBar', () => {
    it('should return the admin identity bar', () => {
      const placementRequestDetail = placementRequestDetailFactory.build()

      expect(adminIdentityBar(placementRequestDetail)).toEqual({
        title: {
          html: title(placementRequestDetail),
        },
        menus: [{ items: adminActions(placementRequestDetail) }],
      })
    })

    it('should return the bar without a menu if the placement request has been withdrawn', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ isWithdrawn: true })

      expect(adminIdentityBar(placementRequestDetail)).toEqual({
        title: {
          html: title(placementRequestDetail),
        },
      })
    })
  })
})
