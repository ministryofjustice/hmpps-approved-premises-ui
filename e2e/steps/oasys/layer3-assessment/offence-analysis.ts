import { expect, Page } from '@playwright/test'

export const completeOffenceAnalysis = async (page: Page, includeSexualOffence: boolean = true) => {
  await page.fill(
    '#textarea_2_1',
    "OASys Question - '2.1 Brief offence(s) details (indicate what exactly happened, when, where and how)' - Answer Input - 'High Rosh risk to Partners, Medium Rosh risk to male peers & children'",
  )
  await page
    .locator('[for="itm_2_2_V2_WEAPON"]', { hasText: 'Carrying or using a weapon' })
    .selectOption('2.2_V2_WEAPON~YES')
  await page.getByRole('textbox', { name: 'Specify which weapon' }).fill('Club')
  await page
    .locator('[for="itm_2_2_V2_ANYVIOL"]', { hasText: 'Any violence or threat of violence / coercion' })
    .selectOption('2.2_V2_ANYVIOL~YES')
  await page
    .locator('[for="itm_2_2_V2_EXCESSIVE"]', { hasText: 'Excessive use of violence / sadistic violence' })
    .selectOption('2.2_V2_EXCESSIVE~YES')
  await page.locator('[for="itm_2_2_V2_ARSON"]', { hasText: 'Arson' }).selectOption('2.2_V2_ARSON~NO')
  await page
    .locator('[for="itm_2_2_V2_PHYSICALDAM"]', { hasText: 'Physical damage to property' })
    .selectOption('2.2_V2_PHYSICALDAM~NO')
  await page
    .locator('[for="itm_2_2_V2_SEXUAL"]', { hasText: 'Sexual element' })
    .selectOption(includeSexualOffence ? '2.2_V2_SEXUAL~YES' : '2.2_V2_SEXUAL~NO')
  await page.locator('[for="itm_2_2_V2_DOM_ABUSE"]', { hasText: 'Domestic abuse' }).selectOption('2.2_V2_DOM_ABUSE~NO')
  await page
    .getByLabel(
      'How much responsibility does s/he acknowledge for the offence(s). Does s/he blame others, minimise the extent of his / her offending? - additional information spellcheck available',
    )
    .fill('Auto test')
  await page.locator("[value='Enter Victim Details']").click()
  await expect(page.locator('#R6262620100578238 > h2')).toHaveText('Victim’s Relationship to Perpetrator')
  await page.getByLabel('Approx. Age').selectOption({ label: '26-49' })
  await page.getByLabel('Gender').selectOption({ label: 'Male' })
  await page.getByLabel('Race/Ethnicity').selectOption({ label: 'White - Irish' })
  await page.getByLabel('Victim - perpetrator relationship').selectOption({ label: 'Spouse/Partner - live in' })
  await page.click('input[value="Save"]')
  await page.click('input[value="Close"]')
  await page.fill(
    '#textarea_2_4_2',
    "OASys Question - 'Victim - perpetrator relationship' - Answer Input - 'Spouse/Partner - Live in",
  )
  await page.fill(
    '#textarea_2_4_1',
    "OASys Question - 'Any other information of specific note, consider vulnerability' - Answer Input - 'Test Other Information",
  )
  await page.fill(
    '#textarea_2_5',
    "OASys Question - '2.5 Impact on the victim (Note any particular consequences)'  - Answer Input - 'Test Impact - Very detrimental impact and sleeplessness'",
  )
  await page
    .getByLabel(
      'Does the offender recognise the impact and consequences of offending on victim, community / wider society?',
    )
    .selectOption('2.6~NO')
  await page.getByLabel('Were there other offenders involved?').selectOption('2.7~NO')
  await page.getByLabel('Peer group influences (eg offender easily led, gang member)').selectOption('2.7.2~NO')
  await page.fill(
    '#textarea_2_8',
    "OASys Question - '2.8 Why did it happen - evidence of motivation and triggers'  - Answer Input - 'Test Motivation and Trigger - Alcohol & Drugs'",
  )
  await page.fill(
    '#textarea_2_12',
    "OASys Question - '2.12 Pattern of offending (consider details of previous convictions)'  - Answer Input - 'Test Pattern -  violence with some property offending'",
  )
  await page.fill(
    '#textarea_2_98',
    "OASys Question - 'Identify offence analysis issues contributing to risks of offending and harm. Please include any positive factors.'  - Answer Input - 'Test Contributions'",
  )
  await page
    .getByLabel('Are the current offence(s) an escalation in seriousness from previous offending?')
    .selectOption('2.13~YES')
  await page
    .getByLabel('Are current offence(s) part of an established pattern of similar offending')
    .selectOption('2.14~NO')
  await page.keyboard.down('End')
  await page.click('input[value="Save"]')
  await page.click('input[value="Next"]')
  await expect(page.locator('#contextleft > h3')).toHaveText('3 - Accommodation (Layer 3)')
}
