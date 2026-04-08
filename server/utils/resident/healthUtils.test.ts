import { PersonAcctAlert } from '@approved-premises/api'
import { render } from 'nunjucks'
import { faker } from '@faker-js/faker'
import {
  acctAlertFactory,
  bookingDetailsFactory,
  cas1OasysGroupFactory,
  cas1SpaceBookingFactory,
  dietAndAllergyResponseFactory,
} from '../../testutils/factories'
import {
  dietCard,
  getSmokingStatus,
  healthDetailsCards,
  healthSideNavigation,
  mentalHealthCards,
  smokingStatusMapping,
} from './healthUtils'
import { DateFormats } from '../dateUtils'
import { oasysMetadataRow, tableRow } from './riskUtils'
import { loadingErrorMessage } from '.'
import { ApiOutcome } from '../utils'
import * as healthUtils from './healthUtils'
import { bulletList, summaryListItem } from '../formUtils'
import { dietaryItemDtoFactory } from '../../testutils/factories/dietAndAllergyResponse'

jest.mock('nunjucks')

describe('healthUtils', () => {
  const placement = cas1SpaceBookingFactory.build()
  const { crn } = placement.person

  const success: ApiOutcome = 'success'

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
    const defaultArguments = {
      supportingInformation: cas1OasysGroupFactory.supportingInformation().build(),
      supportingInformationOutcome: success,
      bookingDetails: bookingDetailsFactory.build({
        profileInformation: [{ type: 'SMOKE', resultValue: 'Yes' }],
      }),
      bookingDetailsOutcome: success,
      dietAndAllergy: dietAndAllergyResponseFactory.build(),
      dietAndAllergyOutcome: success,
      crn,
      placementId: placement.id,
    }
    it('should render error card for recent assessment (FM-286)', () => {
      const result = healthDetailsCards(defaultArguments)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({ html: 'Nunjucks template partials/insetText.njk' })
      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `<p>We cannot load general health - any physical or mental health conditions right now.</p>
         <p>Go to OASys to check if any general health details have been entered.</p>`,
      )
      expect(result[2]).toEqual(expect.objectContaining({ card: { title: { text: 'Diet and food allergies' } } }))
      expect(result[3]).toEqual({
        card: { title: { text: 'Smoker or vaper' } },
        topHtml:
          '<p class="govuk-body-m govuk-hint govuk-!-margin-bottom-2">Imported from Digital Prison Service (DPS)</p>',
        rows: [{ key: { text: 'Smoker or vaper' }, value: { text: 'Smoker' } }],
      })
    })

    it('should render the health details cards for a legacy assessment before April 5th 2025', () => {
      const supportingInformation = cas1OasysGroupFactory
        .supportingInformation()
        .build({ assessmentMetadata: { dateCompleted: '2025-04-01T00:00:00' } })

      const result = healthDetailsCards({ ...defaultArguments, supportingInformation })

      expect(result[1].html).toMatchStringIgnoringWhitespace(
        `${oasysMetadataRow('13.1', 'OASys supporting information', supportingInformation)}Nunjucks template partials/detailsBlock.njk`,
      )
    })

    describe('diet and allergy', () => {
      afterEach(() => {
        jest.restoreAllMocks()
      })
      const dietAndAllergyResponse = dietAndAllergyResponseFactory.build()

      it('should render the diet and allergy card', () => {
        jest.spyOn(healthUtils, 'getLastUpdated').mockReturnValue('2026-03-01')
        jest.spyOn(healthUtils, 'listDietItems').mockReturnValue('(list)')

        const result = dietCard(dietAndAllergyResponse, 'success')

        expect(result.card).toEqual({ title: { text: 'Diet and food allergies' } })
        expect(result.topHtml).toEqual(
          `<p class="govuk-body-m govuk-hint govuk-!-margin-bottom-2">Imported from Digital Prison Service (DPS)</p><p class="govuk-body-m govuk-hint">Last updated: Sun 1 Mar 2026</p>`,
        )
        expect(result.rows).toEqual(
          expect.arrayContaining([
            summaryListItem('Medical diet', '(list)', 'html'),
            summaryListItem('Food allergies', '(list)', 'html'),
            summaryListItem('Personalised dietary requirements', '(list)', 'html'),
            { key: { text: 'Catering instructions' }, value: { html: expect.anything() } },
          ]),
        )
      })

      it('should handle an empty response', () => {
        const result = dietCard(undefined, 'success')
        expect(result.topHtml).toEqual('No diet and allergy information found in Digital Prison Service (DPS)')
      })

      it('should handle an error response', () => {
        const result = dietCard(dietAndAllergyResponse, 'failure')
        expect(result.topHtml).toEqual(
          'We cannot load diet and allergy information right now because Digital Prison Service (DPS) is not available.<br>Try again later',
        )
      })

      it('should format item lists', () => {
        const item1 = dietaryItemDtoFactory.build({ comment: undefined, value: { description: 'description 1' } })
        const item2 = dietaryItemDtoFactory.build({ comment: 'Comment 2', value: { description: 'description 2' } })
        const expected2 = 'description 2<span>: Comment 2</span>'

        expect(healthUtils.listDietItems([item1])).toEqual('description 1')
        expect(healthUtils.listDietItems([item2])).toEqual(expected2)
        expect(healthUtils.listDietItems([item1, item2])).toEqual(bulletList(['description 1', expected2]))
      })

      it('should find latest lastUpdated date', async () => {
        const soon = DateFormats.dateObjToIsoDate(faker.date.soon())
        const response = dietAndAllergyResponseFactory.build({
          dietAndAllergy: { foodAllergies: { lastModifiedAt: soon } },
        })

        const result = dietCard(response, 'success')
        expect(result.topHtml).toEqual(
          `<p class="govuk-body-m govuk-hint govuk-!-margin-bottom-2">Imported from Digital Prison Service (DPS)</p><p class="govuk-body-m govuk-hint">Last updated: ${DateFormats.isoDateToUIDate(soon)}</p>`,
        )
      })
    })

    describe('smoker details', () => {
      it('should include error card when booking details fetch fails', () => {
        const result = healthDetailsCards({
          ...defaultArguments,
          bookingDetails: undefined,
          bookingDetailsOutcome: 'failure',
        })

        expect(result[3].topHtml).toMatchStringIgnoringWhitespace(
          loadingErrorMessage('failure', 'smoking status', 'dps'),
        )
      })

      it('should include error card when no booking details', () => {
        const result = healthDetailsCards({
          ...defaultArguments,
          bookingDetails: undefined,
          bookingDetailsOutcome: 'success',
        })

        expect(result[3]).toEqual({
          card: { title: { text: 'Smoker or vaper' } },
          topHtml: 'No smoking status information found in Digital Prison Service (DPS)',
        })
      })
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
    const errorRts = loadingErrorMessage('failure', 'OASys risk to self', 'oasys')

    expect(result[1].html).toMatchStringIgnoringWhitespace(errorRts)
    expect(result[6].html).toMatchStringIgnoringWhitespace(errorRts)
    expect(result[7].html).toMatchStringIgnoringWhitespace(
      loadingErrorMessage('failure', 'OASys supporting information', 'oasys'),
    )
    expect(result[8].html).toMatchStringIgnoringWhitespace(loadingErrorMessage('failure', 'ACCT alerts', 'dps'))
  })

  describe('getSmokingStatus', () => {
    it.each([...Object.entries(smokingStatusMapping), ['unknown', 'unknown']])(
      'if value is "%s", it should return %s',
      (resultValue, expected) => {
        const bookingDetails = bookingDetailsFactory.build({
          profileInformation: [{ type: 'SMOKE', resultValue }],
        })
        expect(getSmokingStatus(bookingDetails)).toBe(expected)
      },
    )
    it('should return undefined if no smoke profile row', () => {
      const bookingDetails = bookingDetailsFactory.build({
        profileInformation: [{ type: 'NOTSMOKE', resultValue: 'resultValue' }],
      })
      expect(getSmokingStatus(bookingDetails)).toBe(undefined)
    })
  })
})
