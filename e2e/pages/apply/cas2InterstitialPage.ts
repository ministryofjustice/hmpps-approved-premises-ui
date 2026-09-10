import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class Cas2InterstitialPage extends BasePage {

async shouldShowInterstitialHeading() {
    await expect(this.page.getByRole('heading', { name: 'may be eligible for Short-term accomodation (CAS2)' })).toBeVisible()
}

async clickContinue() {
    await this.page.getByRole('button', { name: 'Continue' }).click()
}

async shouldShowInformationHeading() {
    await expect(this.page.getByRole('heading', { name: 'About Short-term accomodation (CAS2)' })).toBeVisible()
}

async clickApplyForCas1() {
    await this.page.getByRole('link', { name: 'Apply for Approved Premises (CAS1) anyway' }).click()
}

async clickApplyForCas2() {
    await this.page.getByRole('button', { name: 'Apply for Short-term accomodation (CAS2)' }).click()
}

}


