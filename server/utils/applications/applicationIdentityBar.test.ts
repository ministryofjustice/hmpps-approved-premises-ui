import { fromPartial } from '@total-typescript/shoehorn'
import { applicationFactory, personFactory } from '../../testutils/factories'
import { applicationIdentityBar, applicationMenuItems, applicationTitle } from './applicationIdentityBar'
import paths from '../../paths/apply'
import { displayName } from '../personUtils'

describe('applicationIdentityBar', () => {
  describe('applicationTitle', () => {
    it('should return the title of the application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">${displayName(person)}</h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })

    it('should show a tag for an offline application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, type: 'Offline' })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">
          ${displayName(person)}
          <strong class="govuk-tag govuk-tag--grey govuk-!-margin-5" >Offline application</strong>
        </h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })

    it('should show a tag for a withdrawn application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, status: 'withdrawn' })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">
          ${displayName(person)}
          <strong class="govuk-tag govuk-tag--red govuk-!-margin-5" data-cy-status="withdrawn">Application withdrawn</strong>
        </h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })

    it('should show a tag for an expired application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, status: 'expired' })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">
          ${displayName(person)}
          <strong class="govuk-tag govuk-tag--red govuk-!-margin-5" data-cy-status="expired">Expired application</strong>
        </h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })
  })

  describe('applicationMenuItems', () => {
    const userId = 'some-id'

    it('should return the option to withdraw an application', () => {
      const application = applicationFactory.build({ createdByUserId: userId })
      expect(applicationMenuItems(application, fromPartial({ roles: ['applicant'], id: userId }))).toEqual([
        {
          text: 'Withdraw application or placement request',
          href: paths.applications.withdraw.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })

    describe('if the application is withdrawn', () => {
      it('should return the Withdraw menu item', () => {
        const application = applicationFactory.build({ createdByUserId: userId })
        expect(applicationMenuItems(application, fromPartial({ roles: ['workflow_manager'], id: userId }))).toEqual([
          {
            text: 'Withdraw application or placement request',
            href: paths.applications.withdraw.new({ id: application.id }),
            classes: 'govuk-button--secondary',
            attributes: {
              'data-cy-withdraw-application': application.id,
            },
          },
        ])
      })
    })

    it('should return an appeals link when user has cas1 process an appeal permission and the application has been rejected', () => {
      const application = applicationFactory.build({ status: 'rejected', createdByUserId: userId })
      expect(
        applicationMenuItems(application, fromPartial({ permissions: ['cas1_process_an_appeal'], id: userId })),
      ).toEqual([
        {
          text: 'Withdraw application or placement request',
          href: paths.applications.withdraw.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
        {
          text: 'Process an appeal',
          href: paths.applications.appeals.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-appeal-application': application.id,
          },
        },
      ])
    })

    it('should not return an appeals link when user has cas1 process an appeal permission and the application has not been rejected', () => {
      const application = applicationFactory.build({ status: 'assesmentInProgress', createdByUserId: userId })
      expect(
        applicationMenuItems(application, fromPartial({ permissions: ['cas1_process_an_appeal'], id: userId })),
      ).toEqual([
        {
          text: 'Withdraw application or placement request',
          href: paths.applications.withdraw.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })

    it('should not return an appeals link when user does not have cas1 process an appeal permission and the application has been rejected', () => {
      const application = applicationFactory.build({ status: 'rejected', createdByUserId: userId })
      expect(applicationMenuItems(application, fromPartial({ permissions: [], id: userId }))).toEqual([
        {
          text: 'Withdraw application or placement request',
          href: paths.applications.withdraw.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })
  })

  describe('applicationIdentityBar', () => {
    it('should return the identity bar', () => {
      const userId = 'some-id'
      const user = { roles: ['appeals_manager' as const], id: userId }
      const application = applicationFactory.build({ createdByUserId: userId })

      expect(applicationIdentityBar(application, 'title', fromPartial(user))).toEqual({
        title: { html: applicationTitle(application, 'title') },
        classes: 'application-identity-bar',
        menus: [{ items: applicationMenuItems(application, fromPartial(user)) }],
      })
    })

    it('should not return the menus property if applicationMenuItems returns undefined', () => {
      const application = applicationFactory.build({ status: 'withdrawn' })

      expect(applicationIdentityBar(application, 'title', fromPartial({ roles: ['appeals_manager'] }))).toEqual({
        title: { html: applicationTitle(application, 'title') },
        classes: 'application-identity-bar',
      })
    })
  })
})
