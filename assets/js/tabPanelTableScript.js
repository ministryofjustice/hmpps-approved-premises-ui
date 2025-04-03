class SubNavAsTabs {
  constructor(navigationElement) {
    this.navLinks = navigationElement.querySelectorAll('.moj-sub-navigation__item a')
    this.panels = [...this.navLinks].map(navLink => document.querySelector('#' + navLink.getAttribute('aria-controls')))

    this.init()
  }

  init() {
    this.showPanel(this.panels[0])
    this.setCurrent(this.navLinks[0])

    for (let i = 0; i < this.navLinks.length; i++) {
      this.navLinks[i].addEventListener('click', e => this.handleClick(e))
    }
  }

  handleClick(e) {
    e.preventDefault()

    const link = e.target
    const id = link.attributes['aria-controls'].value
    const panel = document.querySelector('#' + id)

    this.showPanel(panel)
    this.setCurrent(link)
  }

  hidePanels() {
    for (let i = 0; i < this.panels.length; i++) {
      this.panels[i].classList.add('govuk-visually-hidden')
    }
  }

  showPanel(panel) {
    this.hidePanels()
    panel.classList.remove('govuk-visually-hidden')
  }

  setCurrent(current) {
    for (let i = 0; i < this.panels.length; i++) {
      this.navLinks[i].removeAttribute('aria-selected')
    }

    current.setAttribute('aria-selected', 'true')
  }
}

export default SubNavAsTabs
