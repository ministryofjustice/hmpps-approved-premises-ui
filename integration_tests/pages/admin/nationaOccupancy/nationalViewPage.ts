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
    this.verifyTextInputContentsById('postcodeArea', '')
    this.shouldHaveSelectText('apArea', "All areas - Men's")
    this.shouldHaveSelectText('apType', 'Standard (all AP types)')
    Object.values(roomCharacteristicMap).forEach(label => this.verifyCheckboxByLabel(label, false))
    Object.values(spaceSearchCriteriaApLevelLabels).forEach(label => this.verifyCheckboxByLabel(label, false))
  }

  setInvalidFilters() {
    this.completeTextInput('postcodeArea', 'SW5LX')
    this.completeDatePicker('arrivalDate', '2025-6-45')
  }

  setValidFilters(settings: Record<string, string | Array<string>>) {
    this.completeTextInput('postcodeArea', settings.postcodeArea as string)
    this.completeTextInput('arrivalDate', settings.arrivalDate as string)
    this.getSelectInputByIdAndSelectAnEntry('apArea', settings.apArea as string)
    this.getSelectInputByIdAndSelectAnEntry('apType', settings.apType as string)
    makeArrayOfType(settings.apCharacteristics).forEach(characteristic => {
      this.checkCheckboxByNameAndValue('apCharacteristics', characteristic as string)
    })
    makeArrayOfType(settings.roomCharacteristics).forEach(characteristic => {
      this.checkCheckboxByNameAndValue('roomCharacteristics', characteristic as string)
    })
  }

  applyFilters() {
    this.clickButton('Apply filters')
  }

  shouldSeeValidationErrors() {
    this.shouldShowErrorMessagesForFields(['postcodeArea'], {
      postcodeArea: 'Invalid postcode area',
      arrivalDate: 'Invalid arrival date',
    })
  }

  submitCheckQueryParameters(expected) {
    cy.intercept(`${paths.admin.nationalOccupancy.weekView({})}*`, req => {
      req.continue()
    }).as('filter')

    this.applyFilters()
    cy.wait('@filter').then(({ request }) => {
      const query = request.query as Record<string, unknown>
      query.apCharacteristics = makeArrayOfType(query.apCharacteristics)
      query.roomCharacteristics = makeArrayOfType(query.roomCharacteristics)
      expect(query).to.eql(expected)
    })
  }
}
