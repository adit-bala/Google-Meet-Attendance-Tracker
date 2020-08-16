const MDCList = mdc.list.MDCList
const classList = new MDCList(document.querySelector('#class-list'))
classList.singleSelection = true
classList.listen('MDCList:action', (event) => {
    document.getElementById('select-button').removeAttribute('disabled')
})

const MDCDialog = mdc.dialog.MDCDialog
const selectDialog = new MDCDialog(document.getElementById('select'))
selectDialog.scrimClickAction = ''
selectDialog.escapeKeyAction = ''
selectDialog.open()

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
}

// const MDCTextField = mdc.textField.MDCTextField
// const textField = new MDCTextField(document.querySelector('.mdc-text-field'));

const MDCSnackbar = mdc.snackbar.MDCSnackbar
const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'))

const MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
const linearProgress = new MDCLinearProgress(
    document.querySelector('.mdc-linear-progress')
)
linearProgress.progress = 0
let port = chrome.runtime.connect()
port.onMessage.addListener(function (msg) {
    linearProgress.progress = msg.progress
    if (msg.done) {
        const error = msg.error
        if (error) {
            snackbar.labelText = error
        } else {
            snackbar.labelText = 'Successfully updated sheet!'
            snackbar.actionButtonText = 'OK'
        }
        snackbar.open()
    }
})
document.getElementById('export').addEventListener('click', function () {
    port.postMessage({ data: 'export', code: getMeetCode() })
    console.log('Exporting...')
})
document.getElementById('retry').addEventListener('click', function () {
    port.postMessage({ data: 'export', code: getMeetCode() })
    console.log('Exporting...')
})

const MDCRipple = mdc.ripple.MDCRipple
classList.listElements.map((listItemEl) => new MDCRipple(listItemEl))
new MDCRipple(document.querySelector('#add-class'))

const sortOptions = new MDCList(document.querySelector('#sort-options'))
sortOptions.listElements.map((listItemEl) => new MDCRipple(listItemEl))
