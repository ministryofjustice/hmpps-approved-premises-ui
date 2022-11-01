import Page from '../page'

export default class RehabilitativeInterventions extends Page {
  constructor() {
    super("Which rehabilitative interventions will support the person's Approved Premises (AP) placement?")
  }

  completeForm(): void {
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'accomodation')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'drugsAndAlcohol')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'childrenAndFamilies')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'health')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'educationTrainingAndEmployment')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'financeBenefitsAndDebt')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'attitudesAndBehaviour')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'abuse')
    this.checkCheckboxByNameAndValue('rehabilitativeInterventions', 'other')
    this.getTextInputByIdAndEnterDetails('otherIntervention', 'another one')
  }
}
