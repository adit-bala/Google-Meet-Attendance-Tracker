const MDCList = mdc.list.MDCList
const classList = new MDCList(document.querySelector('#class-list'))
classList.singleSelection = true
classList.listen('MDCList:action', (event) => {
    document.getElementById('select-button').removeAttribute('disabled')
    console.log(classList.selectedIndex)
})

const MDCDialog = mdc.dialog.MDCDialog
const selectDialog = new MDCDialog(document.getElementById('select'))
selectDialog.scrimClickAction = ''
selectDialog.escapeKeyAction = ''
document.getElementById('add-class').addEventListener('click', function () {
    console.log('bruh')
})
selectDialog.open()

const classDialog = new MDCDialog(document.getElementById('class'))
document.getElementById('attendance').addEventListener('click', function () {
    // chrome.runtime.sendMessage({
    //     data: 'export',
    //     code: getMeetCode(),
    // })
    classDialog.open()
})
classDialog.listen('MDCDialog:opened', () => {
    classList.layout()
})

const left = document.getElementsByClassName('left')[0]
if (left) {
    left.addEventListener('click', function () {
        classDialog.close()
    })
}

const MDCMenu = mdc.menu.MDCMenu
const menuElements = [...document.getElementsByClassName('mdc-menu')]
const menus = menuElements.map((menuElement) => new MDCMenu(menuElement))
const optionButtons = [...document.getElementsByClassName('more')]
optionButtons.forEach((element, index) => {
    element.addEventListener('click', function () {
        openMenu(index)
    })
})

function openMenu(index) {
    const menu = menus[index]
    menu.open = true
    menu.setFixedPosition(true)
    // const width =
    //     document.getElementsByClassName('mdc-dialog__container')[0]
    //         .offsetWidth
    // menuElements[index].style['margin-left'] = width + 'px'
}

// const MDCTextField = mdc.textField.MDCTextField
// const textField = new MDCTextField(document.querySelector('.mdc-text-field'));

const MDCRipple = mdc.ripple.MDCRipple
classList.listElements.map((listItemEl) => new MDCRipple(listItemEl))
new MDCRipple(document.querySelector('#add-class'))

const sortOptions = new MDCList(document.querySelector('#sort-options'))
sortOptions.listElements.map((listItemEl) => new MDCRipple(listItemEl))