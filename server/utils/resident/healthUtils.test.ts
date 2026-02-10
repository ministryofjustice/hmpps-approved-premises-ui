import { PersonAcctAlert } from '@approved-premises/api'
import { render } from 'nunjucks'
import { acctAlertFactory, cas1OasysGroupFactory, cas1SpaceBookingFactory } from '../../testutils/factories'
import { healthDetailsCards, healthSideNavigation, mentalHealthCards } from './healthUtils'
import { DateFormats } from '../dateUtils'
import { oasysMetadataRow, tableRow } from './riskUtils'

jest.mock('nunjucks')

describe('healthUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

  beforeEach(() => {
    ;(render as jest.Mock).mockImplementation(template => `Nunjucks template ${template}`)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('healthSideNavigation', () => {
    it('should render the health side navigation', () => {
      const basePath = `/manage/resident/${crn}/placement/${placement.id}/health/`
      expect(healthSideNavigation('healthDetails', crn, placement.id)).toEqual([
        {
          active: true,
          href: `${basePath}healthDetails`,
          text: 'Health and disability',
        },
        {
          active: false,
          href: `${basePath}mentalHealth`,
          text: 'Mental health',
        },
      ])
    })
  })

  describe('healthDetailsCards', () => {
    it('should render error card for recent assessment (FM-286)', () => {
      const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      const result = healthDetailsCards(supportingInformation)

      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `<p>We cannot load general health - any physical or mental health conditions right now.</p>
         <p>Go to OASys to check if any general health details have been entered.</p>`,
      )
    })

    it('should render the health details cards for a legacy assessment before April 5th 2025', () => {
      const supportingInformation = cas1OasysGroupFactory
        .supportingInformation()
        .build({ assessmentMetadata: { dateCompleted: '2025-04-01T00:00:00' } })

      const result = healthDetailsCards(supportingInformation)

      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('13.1', 'OASys supporting information', supportingInformation)}Nunjucks template partials/detailsBlock.njk`,
      )
    })
  })

  describe('mentalHealthCards', () => {
    it('should render the mental health cards', () => {
      const acctAlerts = acctAlertFactory.buildList(2)
      const riskToSelf = cas1OasysGroupFactory.riskToSelf().build()
      const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      const result = mentalHealthCards(acctAlerts, riskToSelf, supportingInformation)

      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', {
        html: 'Imported from Digital Prison Service and OASys',
      })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('FA62', 'OASys risk to self', riskToSelf)}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[2].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('FA63', 'OASys risk to self', riskToSelf)}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[3].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('FA64', 'OASys risk to self', riskToSelf)}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[7].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('10.9', 'OASys supporting information', supportingInformation)}Nunjucks template partials/detailsBlock.njk`,
      )
      expect(result[8]).toEqual({
        card: { title: { text: 'ACCT alerts' } },
        table: {
          head: [{ text: 'Date created' }, { text: 'Description' }, { text: 'Expiry date' }],
          rows: acctAlerts.map((acctAlert: PersonAcctAlert) => [
            {
              html: `<span class="govuk-table__cell--nowrap">${DateFormats.isoDateToUIDate(acctAlert.dateCreated, { format: 'short' })}</span>`,
            },
            { text: acctAlert.description },
            {
              html: `<span class="govuk-table__cell--nowrap">${DateFormats.isoDateToUIDate(acctAlert.dateExpires, { format: 'short' })}</span>`,
            },
          ]),
        },
        topHtml: tableRow('Imported from Digital Prison Service'),
      })
    })
  })
})
