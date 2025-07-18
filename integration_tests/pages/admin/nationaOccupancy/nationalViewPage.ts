import Page from '../../page'
import paths from '../../../../server/paths/admin'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { roomCharacteristicMap, spaceSearchCriteriaApLevelLabels } from '../../../../server/utils/characteristicsUtils'
import { makeArrayOfType } from '../../../../server/utils/utils'

export default class NationalViewPage extends Page {
  constructor(title = 'View all Approved Premises spaces') {
    super(title)
  }

  static visit(query?: string): NationalViewPage {
    const path = paths.admin.nationalOccupancy.weekView({})
    cy.visit(query ? `${path}?${query}` : path)
    return new NationalViewPage()
  }

  static visitUnauthorised() {
    cy.visit(paths.admin.nationalOccupancy.weekView({}), { failOnStatusCode: false })
    return new NationalViewPage(`Authorisation Error`)
  }

  verifyDefaultSettings() {
    this.verifyTextInputContentsById(
      'arrivalDate',
      DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date()), { format: 'datePicker' }),
    )
    this.verifyTextInputContentsById('postcode', '')
    this.shouldHaveSelectText('apArea', "All areas - Men's")
    this.shouldHaveSelectText('apType', 'Standard (all AP types)')
    Object.values(roomCharacteristicMap).forEach(label => this.verifyCheckboxByLabel(label, false))
    Object.values(spaceSearchCriteriaApLevelLabels).forEach(label => this.verifyCheckboxByLabel(label, false))
  }

  setInvalidFilters() {
    this.clearInput('postcode')
    this.completeTextInput('postcode', 'SW5LX')
    this.completeDatePicker('arrivalDate', '2025-6-45')
  }

  setValidFilters(settings: Record<string, string | Array<string>>) {
    this.clearInput('postcode')
    this.completeTextInput('postcode', settings.postcode as string)
    this.clearInput('arrivalDate')
    this.completeTextInput('arrivalDate', settings.arrivalDate as string)
    this.getSelectInputByIdAndSelectAnEntry('apArea', settings.apArea as string)
    this.getSelectInputByIdAndSelectAnEntry('apType', settings.apType as string)
    makeArrayOfType(settings.apCriteria).forEach(characteristic => {
      this.checkCheckboxByNameAndValue('apCriteria', characteristic as string)
    })
    makeArrayOfType(settings.roomCriteria).forEach(characteristic => {
      this.checkCheckboxByNameAndValue('roomCriteria', characteristic as string)
    })
  }

  shouldSeeValidationErrors() {
    this.shouldShowErrorMessagesForFields(['postcode', 'arrivalDate'], {
      postcode: 'Enter a valid postcode area',
      arrivalDate: 'Enter a valid arrival date',
    })
  }

  submitCheckQueryParameters(expected) {
    cy.intercept(`${paths.admin.nationalOccupancy.weekView({})}*`, req => {
      req.continue()
    }).as('filter')

    this.clickButton('Apply filters')
    cy.wait('@filter').then(({ request }) => {
      const query = request.query as Record<string, unknown>
      query.apCriteria = makeArrayOfType(query.apCriteria)
      query.roomCriteria = makeArrayOfType(query.roomCriteria)
      expect(query).to.eql(expected)
    })
  }

  verifyFiltersPopulated(expected) {
    this.verifyTextInputContentsById('postcode', expected.postcode)
    this.verifyTextInputContentsById('arrivalDate', expected.arrivalDate)
    this.shouldBeSelected(expected.apArea)
    this.shouldBeSelected(expected.apType)
    expected.apCriteria.forEach(characteristic => this.verifyCheckboxByNameAndValue('apCriteria', characteristic))
    expected.roomCriteria.forEach(characteristic => this.verifyCheckboxByNameAndValue('roomCriteria', characteristic))
  }
}
