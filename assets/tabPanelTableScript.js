function hidePanels() {
  for (var i = 0; i < panels.length; i++) {
    panels[i].classList.add('govuk-visually-hidden')
  }
}

function showPanel(panel) {
  hidePanels()
  panel.classList.remove('govuk-visually-hidden')
}

function setCurrent(current) {
  for (var i = 0; i < panels.length; i++) {
    navLinks[i].removeAttribute('aria-selected')
  }

  current.setAttribute('aria-selected', 'true')
}

var navLinks = document.querySelectorAll('.moj-sub-navigation__item a')
var panels = document.querySelectorAll('[role="tabpanel"]')

showPanel(panels[0])

for (var i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener('click', function (e) {
    var link = e.target
    var id = link.attributes['aria-controls'].value
    var panel = document.querySelector('#' + id)

    showPanel(panel)
    setCurrent(link)

    e.preventDefault()
  })
}
