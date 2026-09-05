import { expect, Page } from '@playwright/test'

const fillOasysTextarea = async (page: Page, selector: string, value: string) => {
  await page.waitForSelector(selector, { state: 'attached' })

  const textareas = page.locator(selector)
  const count = await textareas.count()
  for (let i = 0; i < count; i += 1) {
    const textarea = textareas.nth(i)
    if ((await textarea.isVisible()) && (await textarea.isEditable())) {
      await textarea.click()
      await textarea.fill(value)
      await textarea.dispatchEvent('input')
      await textarea.dispatchEvent('change')
      await textarea.dispatchEvent('blur')
      break
    }
  }

  // OASys sometimes duplicates backing controls with the same id; write through all editable matches.
  await page.evaluate(
    ({ targetSelector, textValue }) => {
      const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>(targetSelector))
      if (textareas.length === 0) {
        throw new Error(`No textareas found for selector: ${targetSelector}`)
      }

      textareas.forEach(textarea => {
        if (textarea.disabled || textarea.readOnly) return
        textarea.value = textValue
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        textarea.dispatchEvent(new Event('change', { bubbles: true }))
        textarea.dispatchEvent(new Event('blur', { bubbles: true }))
      })
    },
    { targetSelector: selector, textValue: value },
  )
}

export const completeRoSHSection9RoSHSummary = async (page: Page) => {
  await page.getByRole('link', { name: 'RoSH Full Analysis' }).click()
  await page.getByRole('link', { name: 'Section 9' }).click()

  await fillOasysTextarea(
    page,
    '#textarea_FA65',
    'R9.1 Escape and abscond - Provide an analysis of the current / previous escape and abscond concerns - Test previous escape and abscond concerns',
  )
  await fillOasysTextarea(
    page,
    '#textarea_FA66',
    'R9.2 Control Issues / Disruptive Behaviour and Breach of Trust - Provide an analysis of the concerns, the circumstances, relevant issues and needs. Consider aggression, control issues / disruptive behaviour / breach of trust - Test aggression, control issues / disruptive behaviour / breach of trust concerns',
  )

  await page.locator('#B6737316531953403').click()
  await page.getByRole('link', { name: 'RoSH Full Analysis' }).click()
  await page.getByRole('link', { name: 'Section 9' }).click()
  await expect(page.locator('#textarea_FA65').first()).not.toHaveValue('')
  await expect(page.locator('#textarea_FA66').first()).not.toHaveValue('')
  await page.locator('#B6737316531953403').click()
  await expect(page.locator('#contextleft > h3')).toHaveText('Risk of Serious Harm Summary (Layer 3)')
}
