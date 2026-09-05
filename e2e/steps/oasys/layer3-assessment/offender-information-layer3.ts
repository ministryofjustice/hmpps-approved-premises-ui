import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { fillDateOasys } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/inputs.mjs'

const formatOasysDate = (date: Date) =>
  [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map((part, index) => (index < 2 ? String(part).padStart(2, '0') : String(part)))
    .join('/')

const setInputValueEverywhere = async (page: Page, selector: string, value: string) => {
  await page.waitForSelector(selector, { state: 'attached' })
  await page.evaluate(
    ({ targetSelector, nextValue }) => {
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(targetSelector))
      if (!inputs.length) throw new Error(`No input found for ${targetSelector}`)

      inputs.forEach(input => {
        if (input.disabled || input.readOnly) return
        input.value = nextValue
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
        input.dispatchEvent(new Event('blur', { bubbles: true }))
      })
    },
    { targetSelector: selector, nextValue: value },
  )
}

const fillOasysDate = async (page: Page, label: string, selector: string, date: Date) => {
  const formattedDate = formatOasysDate(date)
  await page.getByLabel(label).click()
  await fillDateOasys(page, selector, date)
  await setInputValueEverywhere(page, selector, formattedDate)
}

const fillIfPresent = async (page: Page, label: string, value: string) => {
  const input = page.getByLabel(label)
  if (await input.count()) {
    await input.first().fill(value)
  }
}

const selectIfPresent = async (page: Page, label: string, value: string) => {
  const select = page.getByLabel(label)
  if (await select.count()) {
    await select.first().selectOption(value)
  }
}

export const completeOffenderInformationLayer3 = async (page: Page, person: TestOptions['person']) => {
  const firstSanctionDate = new Date(person.details.dob)
  firstSanctionDate.setFullYear(firstSanctionDate.getFullYear() + 15)

  await page.getByRole('link', { name: 'Section 1', exact: true }).click()
  await page.getByRole('link', { name: 'Offending Information', exact: true }).click()
  await page.getByLabel('Count').fill('1')
  await page.getByRole('link', { name: 'Predictors', exact: true }).click()
  await fillOasysDate(page, 'Date of first sanction', '#itm_1_8_2', firstSanctionDate)
  await page.getByLabel('Total number of sanctions for all offences').fill('11')
  await page.getByLabel('How many of the total number of sanctions involved violent offences?').fill('4')

  const convictionDate = person.convictionDate
  await fillOasysDate(page, 'Date of current conviction', '#itm_1_29', convictionDate)

  const sexualOffenceDropdown = page.locator('tr #itm_1_30')
  if (await sexualOffenceDropdown.isEnabled()) {
    await sexualOffenceDropdown.selectOption('1.30~YES')
    await selectIfPresent(page, 'Does the current offence have a sexual motivation?', '1.41~YES')
  }

  const contactOffenceDropdown = page.getByLabel(
    'Does the current offence involve actual/attempted direct contact against a victim who was a stranger?',
  )
  await contactOffenceDropdown.waitFor({ state: 'visible' })
  await contactOffenceDropdown.selectOption('1.44~YES')

  await fillOasysDate(
    page,
    'Date of most recent sanction involving a sexual/sexually motivated offence',
    '#itm_1_33',
    convictionDate,
  )
  await page
    .getByLabel('Number of previous/current sanctions involving contact adult sexual/sexually motivated offences')
    .fill('1')
  await page
    .getByLabel('Number of previous/current sanctions involving direct contact child sexual/sexually motivated offences')
    .fill('0')
  await page
    .getByLabel(
      'Number of previous/current sanctions involving indecent child image or indirect child contact sexual/sexually motivated offences',
    )
    .fill('0')
  await page
    .getByLabel('Number of previous/current sanctions involving other non-contact sexual/sexually motivated offences')
    .fill('0')
  await fillOasysDate(page, 'Date of commencement of community sentence', '#itm_1_38', convictionDate)

  await page.click('input[value="Save"]')
  await page.click('input[value="Next"]')
}
