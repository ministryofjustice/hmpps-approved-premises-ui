import { expect, Page } from '@playwright/test'

type OasysTierProfile = 'A' | 'B' | 'C'
type RiskScore = 'Low' | 'Medium' | 'High' | 'Very High'

const roshSummaryScoresByTier: Record<OasysTierProfile, Record<string, RiskScore>> = {
  A: {
    itm_SUM6_1_1: 'Very High',
    itm_SUM6_2_1: 'Very High',
    itm_SUM6_3_1: 'Very High',
    itm_SUM6_4_1: 'Very High',
    itm_SUM6_1_2: 'High',
    itm_SUM6_2_2: 'High',
    itm_SUM6_3_2: 'High',
    itm_SUM6_4_2: 'High',
    itm_SUM6_5_2: 'High',
  },
  B: {
    itm_SUM6_1_1: 'Very High',
    itm_SUM6_2_1: 'Medium',
    itm_SUM6_3_1: 'High',
    itm_SUM6_4_1: 'Medium',
    itm_SUM6_1_2: 'Medium',
    itm_SUM6_2_2: 'Medium',
    itm_SUM6_3_2: 'Medium',
    itm_SUM6_4_2: 'Medium',
    itm_SUM6_5_2: 'Medium',
  },
  C: {
    itm_SUM6_1_1: 'Medium',
    itm_SUM6_2_1: 'Medium',
    itm_SUM6_3_1: 'Medium',
    itm_SUM6_4_1: 'Medium',
    itm_SUM6_1_2: 'Medium',
    itm_SUM6_2_2: 'Medium',
    itm_SUM6_3_2: 'Medium',
    itm_SUM6_4_2: 'Medium',
    itm_SUM6_5_2: 'Medium',
  },
}

const setRoSHSummaryScores = async (page: Page, tier: OasysTierProfile) => {
  await Promise.all(
    Object.entries(roshSummaryScoresByTier[tier]).map(async ([fieldId, score]) => {
      const select = page.locator(`#${fieldId}`)
      if ((await select.count()) === 0) return
      await select.selectOption({ label: score })
    }),
  )
}

export const completeRoSHSection10RoSHSummary = async (page: Page, tier: OasysTierProfile = 'A') => {
  await page.fill('#textarea_SUM1', "OASys Question - 'R10.1 Who is at risk.' - Answer Input - 'Child'")
  await page.fill(
    '#textarea_SUM2',
    "OASys Question - 'R10.2 - What is the nature of the risk' - Answer Input - 'Test Nature'",
  )
  await page.fill(
    '#textarea_SUM9',
    "OASys Question - 'Further analysis of risk factors' - Answer Input - 'Test Risk Greatest'",
  )
  await page.fill(
    '#textarea_SUM10',
    "OASys Question - 'R10.5 - What strengths and protective factors are actively present or could be developed and how will they mitigate the risk factors?' - Answer Input - 'Test Factors to mitigate the risk'",
  )
  await page.fill(
    '#textarea_SUM11',
    "OASys Question - 'R10.3 - In what circumstances or situations would offending be most likely to occur and are any of these currently present' - Answer Input - ' Test lifestyle deterioration & victim proximity circumstances'",
  )
  await page.fill(
    '#textarea_SUM8',
    "OASys Question - 'If necessary record the details of any key documents or reports used in this analysis:' - Answer Input - ' Test documents'",
  )

  await page.locator('select[id^="itm_SUM6_"]').first().waitFor()
  await setRoSHSummaryScores(page, tier)

  await page.keyboard.down('End')
  await page.click('input[value="Save"]')
  await page.click('input[value="Next"]')
  await expect(page.locator('#contextleft > h3')).toHaveText('Risk Management Plan (Layer 3)')
}
