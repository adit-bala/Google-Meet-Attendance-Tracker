const MDCDialog = mdc.dialog.MDCDialog;
const dialog = new MDCDialog(document.querySelector(".mdc-dialog"));
function openDialog() {
  dialog.open();
}

const MDCMenu = mdc.menu.MDCMenu;
let menus = [...document.getElementsByClassName("mdc-menu")]
menus = menus.map(menuElement => new MDCMenu(menuElement))
function openMenu(index) {
  const menu = menus[index]
  menu.open = true;
  menu.setFixedPosition(true);
}

const MDCTextField = mdc.textField.MDCTextField;
const textField = new MDCTextField(document.querySelector('.mdc-text-field'));


const MDCChipSet = mdc.chips.MDCChipSet;
const chipSetEl = document.querySelector('.mdc-chip-set');
const chipSet = new MDCChipSet(chipSetEl);

function changeInput(id) {
  document.getElementById(id).style.display = "none";
}