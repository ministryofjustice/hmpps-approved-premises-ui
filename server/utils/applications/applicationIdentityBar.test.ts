import { faker } from '@faker-js/faker'
import { applicationFactory, personFactory, userDetailsFactory } from '../../testutils/factories'
import { applicationIdentityBar, applicationMenuItems, applicationTitle } from './applicationIdentityBar'
import paths from '../../paths/apply'
import config from '../../config'
import { displayName } from '../personUtils'
import { expirableStatuses, withdrawableStatuses } from './statusTag'

describe('applicationIdentityBar', () => {
  const { flags: originalFlags } = config

  describe('applicationTitle', () => {
    afterEach(() => {
      config.flags = originalFlags
    })

    it('should return the title of the application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person })

      config.flags.oneApplication = true
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-heading-l">heading</h1>
      `)

      config.flags.oneApplication = false
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">${displayName(person)}</h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })

    it('should show a tag for an offline application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, type: 'Offline' })

      config.flags.oneApplication = true
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-heading-l">
          heading
          <strong class="govuk-tag govuk-tag--grey govuk-!-margin-5" >Offline application</strong>
        </h1>
      `)

      config.flags.oneApplication = false
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">${displayName(person)}<strong class="govuk-tag govuk-tag--grey govuk-!-margin-5" >Offline application</strong></h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })

    it('should show a tag for a withdrawn application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, status: 'withdrawn' })

      config.flags.oneApplication = true
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-heading-l">
          heading
          <strong class="govuk-tag govuk-tag--red govuk-!-margin-5" data-cy-status="withdrawn">Application withdrawn</strong>
        </h1>
      `)

      config.flags.oneApplication = false
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">${displayName(person)}<strong class="govuk-tag govuk-tag--red govuk-!-margin-5" data-cy-status="withdrawn">Application withdrawn</strong></h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })

    it('should show a tag for an expired application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, status: 'expired' })

      config.flags.oneApplication = true
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-heading-l">
          heading
          <strong class="govuk-tag govuk-tag--red govuk-!-margin-5" data-cy-status="expired">Expired application</strong>
        </h1>
      `)

      config.flags.oneApplication = false
      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <h1 class="govuk-caption-l">heading</h1>
        <h2 class="govuk-heading-l">${displayName(person)}<strong class="govuk-tag govuk-tag--red govuk-!-margin-5" data-cy-status="expired" >Expired application</strong></h2>
        <h3 class="govuk-caption-m govuk-!-margin-top-1">CRN: ${application.person.crn}</h3>
      `)
    })
  })

  describe('applicationMenuItems', () => {
    const user = userDetailsFactory.build({ id: 'some-id' })
    const applicationId = faker.string.uuid()

    const withdrawButton = {
      text: 'Withdraw application or placement request',
      href: paths.applications.withdraw.new({ id: applicationId }),
      classes: 'govuk-button--secondary',
      attributes: {
        'data-cy-withdraw-application': applicationId,
      },
    }

    it('should return the option to withdraw an application', () => {
      const application = applicationFactory.build({ createdByUserId: user.id, id: applicationId })
      expect(applicationMenuItems(application, user)).toEqual([withdrawButton])
    })

    describe('if the application is withdrawn', () => {
      it('should return the Withdraw menu item', () => {
        const application = applicationFactory.build({ createdByUserId: user.id, id: applicationId })
        expect(applicationMenuItems(application, user)).toEqual([withdrawButton])
      })
    })

    it('should return an appeals link when user has cas1 process an appeal permission and the application has been rejected', () => {
      const application = applicationFactory.build({ status: 'rejected', createdByUserId: user.id, id: applicationId })
      expect(applicationMenuItems(application, { ...user, permissions: ['cas1_process_an_appeal'] })).toEqual([
        withdrawButton,
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
      const application = applicationFactory.build({
        status: 'assesmentInProgress',
        createdByUserId: user.id,
        id: applicationId,
      })
      expect(applicationMenuItems(application, { ...user, permissions: ['cas1_process_an_appeal'] })).toEqual([
        withdrawButton,
      ])
    })

    it('should not return an appeals link when user does not have cas1 process an appeal permission and the application has been rejected', () => {
      const application = applicationFactory.build({ status: 'rejected', createdByUserId: user.id, id: applicationId })
      expect(applicationMenuItems(application, { ...user, permissions: [] })).toEqual([withdrawButton])
    })

    it('should return undefined if the application is withdrawn', () => {
      const application = applicationFactory.build({ status: 'withdrawn', createdByUserId: user.id, id: applicationId })
      expect(applicationMenuItems(application, { ...user, permissions: [] })).toEqual([])
    })

    describe('with singleApplication feature enabled', () => {
      beforeEach(() => {
        config.flags.oneApplication = true
      })
      afterEach(() => {
        config.flags.oneApplication = false
      })

      it.each(expirableStatuses)('should return an expiry button for an application status of %s', status => {
        const application = applicationFactory.build({ status, createdByUserId: user.id, id: applicationId })
        expect(applicationMenuItems(application, { ...user, permissions: [] })).toEqual([
          {
            text: 'Expire application',
            href: paths.applications.expire({ id: applicationId }),
            classes: 'govuk-button--secondary',
          },
        ])
      })

      it.each(withdrawableStatuses)('should return a withdrawal button for an application status of %s', status => {
        const application = applicationFactory.build({ status, createdByUserId: user.id, id: applicationId })
        expect(applicationMenuItems(application, { ...user, permissions: [] })).toEqual([withdrawButton])
      })
    })
  })

  describe('applicationIdentityBar', () => {
    const user = userDetailsFactory.build({ id: 'some-id' })

    it('should return the identity bar', () => {
      const application = applicationFactory.build({ createdByUserId: user.id })

      expect(applicationIdentityBar(application, 'title', user)).toEqual({
        title: { html: applicationTitle(application, 'title') },
        classes: 'application-identity-bar',
        menus: [{ items: applicationMenuItems(application, user) }],
      })
    })

    it('should not return the menus property if applicationMenuItems returns undefined', () => {
      const application = applicationFactory.build({ status: 'withdrawn' })

      expect(applicationIdentityBar(application, 'title', user)).toEqual({
        title: { html: applicationTitle(application, 'title') },
        classes: 'application-identity-bar',
      })
    })
  })
})
