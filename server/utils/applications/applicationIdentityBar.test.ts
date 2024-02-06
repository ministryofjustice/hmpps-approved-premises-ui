import { applicationFactory, personFactory } from '../../testutils/factories'
import { applicationIdentityBar, applicationMenuItems, applicationTitle } from './applicationIdentityBar'
import paths from '../../paths/apply'

describe('applicationIdentityBar', () => {
  describe('applicationTitle', () => {
    it('should return the title of the application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <span class="govuk-caption-l">heading</span>
        <h1 class="govuk-heading-l">${person.name}</h1>
      `)
    })

    it('should return the show a tag for an offline application', () => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person, type: 'Offline' })

      expect(applicationTitle(application, 'heading')).toMatchStringIgnoringWhitespace(`
        <span class="govuk-caption-l">heading</span>
        <h1 class="govuk-heading-l">${person.name}</h1>
        <strong class="govuk-tag govuk-tag--grey govuk-!-margin-5">Offline application</strong>
      `)
    })
  })

  describe('applicationMenuItems', () => {
    it('should return the old withdrawal link when NEW_WITHDRAWALS_FLOW_DISABLED is truthy', () => {
      process.env.NEW_WITHDRAWALS_FLOW_DISABLED = '1'
      const application = applicationFactory.build()
      expect(applicationMenuItems(application)).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdraw.new({ id: application.id }),
          classes: 'govuk-button--secondary',
          attributes: {
            'data-cy-withdraw-application': application.id,
          },
        },
      ])
    })

    it('should return the new withdrawal link when NEW_WITHDRAWALS_FLOW_DISABLED is falsy', () => {
      process.env.NEW_WITHDRAWALS_FLOW_DISABLED = ''
      const application = applicationFactory.build()
      expect(applicationMenuItems(application)).toEqual([
        {
          text: 'Withdraw application',
          href: paths.applications.withdrawables.show({ id: application.id }),
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
      const application = applicationFactory.build()

      expect(applicationIdentityBar(application, 'title')).toEqual({
        title: { html: applicationTitle(application, 'title') },
        classes: 'application-identity-bar',
        menus: [{ items: applicationMenuItems(application) }],
      })
    })
  })
})
