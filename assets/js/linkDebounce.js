function linkDebounce(link, delay = 3000) {
  /**
   *  Adds a debounce of a given duration to the provided element
   *  @param link the element to be debounced
   *  @param delay the period that second clicks will be disabled, in ms
   * */
  let quench = false
  link.addEventListener('click', function (e) {
    if (quench) {
      e.preventDefault()
    } else {
      quench = true
      link.classList.add('link-disabled')
      window.setTimeout(function () {
        link.classList.remove('link-disabled')
        quench = false
      }, delay)
    }
  })
}

export default linkDebounce
