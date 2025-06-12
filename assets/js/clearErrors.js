const errorContainers = '.govuk-error-summary, .govuk-error-message'
const errorClasses = ['govuk-form-group--error', 'govuk-input--error', 'govuk-textarea--error', 'govuk-select--error']

const clearErrorsOnSubmit = form => {
  form.addEventListener('submit', () => {
    document.querySelectorAll(errorContainers).forEach(e => e.remove())
    errorClasses.forEach(className => {
      document.querySelectorAll(`.${className}`).forEach(e => e.classList.remove(className))
    })
  })
}

export default clearErrorsOnSubmit
