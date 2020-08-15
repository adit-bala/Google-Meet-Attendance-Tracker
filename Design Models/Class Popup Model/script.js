const MDCDialog = mdc.dialog.MDCDialog;
const dialog = new MDCDialog(document.querySelector(".mdc-dialog"));
function openDialog() {
  dialog.open();
}

const MDCMenu = mdc.menu.MDCMenu;
let menuElements = [...document.getElementsByClassName("mdc-menu")]
const menus = menuElements.map(menuElement => new MDCMenu(menuElement))
function openMenu(index) {
  const menu = menus[index]
  menu.open = true;
  menu.setFixedPosition(true);
  const width = document.getElementsByClassName("mdc-dialog__container")[0].offsetWidth - 56
  menuElements[index].style["margin-left"] = width + "px"
}

const MDCTextField = mdc.textField.MDCTextField
const textField = new MDCTextField(document.querySelector('.mdc-text-field'));