import { PersonAcctAlert } from '@approved-premises/api'
import { render } from 'nunjucks'
import {
  acctAlertFactory,
  bookingDetailsFactory,
  cas1OasysGroupFactory,
  cas1SpaceBookingFactory,
} from '../../testutils/factories'
import {
  getSmokingStatus,
  healthDetailsCards,
  healthSideNavigation,
  mentalHealthCards,
  smokingStatusMapping,
} from './healthUtils'
import { DateFormats } from '../dateUtils'
import { oasysMetadataRow, tableRow } from './riskUtils'
import { loadingErrorMessage } from '.'

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

      const result = healthDetailsCards(supportingInformation, 'success', null)

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

      const result = healthDetailsCards(supportingInformation, 'success', null)

      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(render).toHaveBeenCalledWith('partials/insetText.njk', { html: 'Imported from OASys' })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('13.1', 'OASys supporting information', supportingInformation)}Nunjucks template partials/detailsBlock.njk`,
      )
    })
  })

  describe('mentalHealthCards', () => {
    it('should render the mental health cards', () => {
      const personAcctAlerts = acctAlertFactory.buildList(2)
      const riskToSelf = cas1OasysGroupFactory.riskToSelf().build()
      const supportingInformation = cas1OasysGroupFactory.supportingInformation().build()

      const result = mentalHealthCards({
        personAcctAlerts,
        riskToSelf,
        supportingInformation,
        riskToSelfOutcome: 'success',
        personAcctAlertsOutcome: 'success',
        supportingInformationOutcome: 'success',
      })

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
          rows: personAcctAlerts.map((acctAlert: PersonAcctAlert) => [
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

  it('should render blank mental health cards when OASys fails', () => {
    const result = mentalHealthCards({
      personAcctAlerts: undefined,
      riskToSelf: undefined,
      supportingInformation: undefined,
      riskToSelfOutcome: 'failure',
      personAcctAlertsOutcome: 'failure',
      supportingInformationOutcome: 'failure',
    })
    const errorRts = loadingErrorMessage({ result: 'failure', item: 'OASys risk to self', source: 'OASys' })

    expect(result[1].html).toMatchStringIgnoringWhitespace(errorRts)
    expect(result[6].html).toMatchStringIgnoringWhitespace(errorRts)
    expect(result[7].html).toMatchStringIgnoringWhitespace(
      loadingErrorMessage({ result: 'failure', item: 'OASys supporting information', source: 'OASys' }),
    )
    expect(result[8].html).toMatchStringIgnoringWhitespace(
      loadingErrorMessage({ result: 'failure', item: 'ACCT alerts', source: 'Digital Prison Service' }),
    )
  })

  describe('getSmokingStatus', () => {
    it.each(Object.entries(smokingStatusMapping))('should return "%s" for %s', (resultValue, expected) => {
      const bookingDetails = bookingDetailsFactory.build({
        profileInformation: [{ type: 'SMOKE', resultValue }],
      })
      expect(getSmokingStatus(bookingDetails)).toBe(expected)
    })
  })
})
