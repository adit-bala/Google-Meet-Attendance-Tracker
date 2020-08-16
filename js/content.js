function storeNames(names) {
    const code = getMeetCode()
    chrome.storage.local.get(null, function (result) {
        // let currentData = result.attendance;
        // let newEntry = {};
        // for (const name of expectedNames) {
        //     newEntry[name] = names.includes(name);
        // }
        // const timestamp = ~~(Date.now() / 1000);
        // currentData[timestamp] = newEntry;
        // chrome.storage.local.set({ 'attendance': currentData });

        const timestamp = ~~(Date.now() / 1000)

        let res = result[code]
        if (res == undefined) {
            res = {
                attendance: {},
                class: 'Period 1',
                'start-timestamp': timestamp,
            }
        }
        let currentData = res.attendance
        res.timestamp = timestamp

        for (const name of names) {
            if (currentData[name] == undefined) {
                currentData[name] = [timestamp]
            } else if (currentData[name].length % 2 === 0) {
                currentData[name].push(timestamp)
            }
            if (names.includes(name)) {
                if (currentData[name].length % 2 === 0) {
                    currentData[name].push(timestamp)
                }
            } else {
                if (currentData[name].length % 2 === 1) {
                    currentData[name].push(timestamp)
                }
            }
        }
        for (const name in currentData) {
            if (!names.includes(name) && currentData[name]) {
                if (currentData[name].length % 2 === 1) {
                    currentData[name].push(timestamp)
                }
            }
        }

        chrome.storage.local.set({ [code]: res })

        for (const key in result) {
            const data = result[key]
            if (data.hasOwnProperty('timestamp')) {
                if (timestamp - data.timestamp >= 86400) {
                    chrome.storage.local.remove([key])
                }
            }
        }
    })
}

function getVisibleAttendees(container, names) {
    const labels = document.getElementsByClassName('cS7aqe NkoVdd')
    for (const label of labels) {
        const name = label.innerHTML
        if (!names.includes(name) && name.slice(-6) !== ' (You)') {
            names.push(name)
        }
    }
    container.scrollTop = 56 * names.length
}

function takeAttendance() {
    const container = document.getElementsByClassName(
        'HALYaf tmIkuc s2gQvd KKjvXb'
    )[0]
    let lastNumNames = 0
    let names = []
    getVisibleAttendees(container, names)
    while (names.length !== lastNumNames) {
        lastNumNames = names.length
        setTimeout(function () {
            getVisibleAttendees(container, names)
        }, 100)
    }
    container.scrollTop = 0
    storeNames(names)
}

function getMeetCode() {
    return document.title.substring(7)
}

function showCard() {
    document.getElementsByClassName('NzPR9b')[0].style.borderRadius = '0px'
    const attendanceButton = document.getElementById('attendance')
    attendanceButton.classList.remove('IeuGXd')
    document.getElementById('card').style.visibility = 'visible'
}

function hideCard() {
    document.getElementsByClassName('NzPR9b')[0].style.borderRadius =
        '0 0 0 8px'
    const attendanceButton = document.getElementById('attendance')
    attendanceButton.classList.add('IeuGXd')
    document.getElementById('card').style.visibility = 'hidden'
}

const peopleObserver = new MutationObserver(function (mutations, me) {
    const container = document.getElementsByClassName(
        'HALYaf tmIkuc s2gQvd KKjvXb'
    )[0]
    if (!container) {
        document.getElementsByClassName('gV3Svc')[1].click()
        tabObserver.observe(document.getElementsByClassName('mKBhCf')[0], {
            childList: true,
            subtree: true,
        })
    } else {
        listObserver.observe(
            document.getElementsByClassName('HALYaf tmIkuc s2gQvd KKjvXb')[0],
            {
                childList: true,
                subtree: true,
            }
        )
    }
})

const tabObserver = new MutationObserver(function (mutations, me) {
    const numAttendees =
        parseInt(
            document.querySelector("[jsname='EydYod']").textContent.slice(1, -1)
        ) - 1
    const names = document.getElementsByClassName('cS7aqe NkoVdd')
    if (numAttendees === 0) {
        takeAttendance()
        me.disconnect()
    } else {
        if (names[1] != undefined) {
            listObserver.observe(
                document.getElementsByClassName(
                    'HALYaf tmIkuc s2gQvd KKjvXb'
                )[0],
                {
                    childList: true,
                    subtree: true,
                }
            )
            me.disconnect()
        }
    }
})

const closedObserver = new MutationObserver(function (mutations, me) {
    if (
        !document.getElementsByClassName(
            'VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ IWtuld wBYOYb'
        )[0]
    ) {
        document.getElementById('card').style.borderRadius = '0 0 0 8px'
        me.disconnect()
    }
})

const listObserver = new MutationObserver(function (mutations, me) {
    takeAttendance()
    me.disconnect()
})

const trayObserver = new MutationObserver(function (mutations, me) {
    const tray = document.getElementsByClassName('lvE3se')[0]
    if (tray) {
        const trayWidth = tray.offsetWidth
        document.getElementById('card').style.width = trayWidth + 'px'
    }
    me.disconnect()
})

const readyObserver = new MutationObserver(function (mutations, me) {
    if (document.getElementsByClassName('wnPUne N0PJ8e')[0]) {
        document.body.insertAdjacentHTML('afterbegin', selectDialogHTML)
        document.body.insertAdjacentHTML('afterbegin', snackbarHTML)

        const bar = document.getElementsByClassName('NzPR9b')[0]
        //const svgPath = chrome.runtime.getURL('img/icon.svg');
        bar.insertAdjacentHTML('afterbegin', buttonHTML)
        document
            .getElementById('attendance')
            .addEventListener('click', showCard)

        const screen = document.getElementsByClassName('crqnQb')[0]
        screen.insertAdjacentHTML('afterbegin', cardHTML)

        document
            .getElementById('close-card')
            .addEventListener('click', hideCard)

        for (let i = 1; i <= 2; i++) {
            document
                .getElementsByClassName('uArJ5e UQuaGc kCyAyd kW31ib foXzLb')
                [i].addEventListener('click', () => {
                    document.getElementById('card').style.borderRadius =
                        '8px 0 0 8px'
                    closedObserver.observe(
                        document.getElementsByClassName('mKBhCf')[0],
                        {
                            childList: true,
                            subtree: true,
                        }
                    )
                })
        }

        trayObserver.observe(document.getElementsByClassName('lvE3se')[0], {
            childList: true,
            subtree: true,
        })
        window.addEventListener('resize', () => {
            const trayWidth = document.getElementsByClassName('lvE3se')[0]
                .offsetWidth
            document.getElementById('card').style.width = trayWidth + 'px'
        })
        document.getElementById('card').style.visibility = 'hidden'

        const showEveryone = document.querySelector(
            '[aria-label="Show everyone"]'
        )
        showEveryone.classList.remove('IeuGXd')

        chrome.runtime.sendMessage({
            data: 'mdc',
        })

        peopleObserver.observe(
            document.getElementsByClassName('wnPUne N0PJ8e')[0],
            {
                childList: true,
            }
        )

        me.disconnect()
    }
})

readyObserver.observe(document.getElementsByClassName('crqnQb')[0], {
    childList: true,
    subtree: true,
})

const cardHTML = `<div class="mdc-card" id="card" style="
    position: fixed;
    top: 48px;
    right: 0;
    z-index: 101;
    width: 304px;
    border-radius: 0 0 0 8px;
    ">
    <div class="mdc-card-header">
        <button
            class="mdc-icon-button card-button material-icons left"
            aria-label="Change class"
        >
            arrow_back
        </button>
        <h2 id="card-title">
            Period 1 Math
        </h2>
        <div class="mdc-menu-surface--anchor right" style="right: 42px;">
            <div class="mdc-menu mdc-menu-surface" role="menu">
                <ul class="mdc-list" id="sort-options">
                    <li
                        class="mdc-list-item mdc-ripple-surface"
                        role="menuitem"
                        tabindex="0"
                    >
                        <span class="mdc-list-item__text"
                            >Sort by Last Name (A - Z)</span
                        >
                    </li>
                    <li
                        class="mdc-list-item mdc-ripple-surface"
                        role="menuitem"
                        tabindex="0"
                    >
                        <span class="mdc-list-item__text"
                            >Sort by Absences</span
                        >
                    </li>
                </ul>
            </div>
        </div>
        <button
            class="mdc-icon-button card-button material-icons more right"
            style="right: 34px;"
            aria-haspopup="menu"
            aria-label="Sort options"
        >
            settings
        </button>
        <button
            class="mdc-icon-button card-button material-icons right" id="close-card"
            aria-label="Exit attendance dialog"
        >
            close
        </button>
    </div>
    <div class="mdc-list-divider" role="separator"></div>
    <div class="mdc-card-content" style="
    max-height: 60vh; overflow: scroll;">
        <ul class="mdc-list mdc-list--dense mdc-list--two-line">
            <li class="mdc-list-item mdc-ripple-surface">
                <span
                    class="mdc-list-item__graphic material-icons green"
                    jscontroller="VXdfxd"
                    jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                    tabindex="0"
                    aria-label="Present Now"
                    data-tooltip="Present Now"
                    data-tooltip-vertical-offset="-12"
                    data-tooltip-horizontal-offset="0"
                >
                    check_circle
                </span>
                <span class="mdc-list-item__text" tabindex="0">
                    <span class="mdc-list-item__primary-text">
                        Aditya Balasubramanian
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here 10:02 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons red"
                    jscontroller="VXdfxd"
                    jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                    tabindex="0"
                    aria-label="Absent"
                    data-tooltip="Absent"
                    data-tooltip-vertical-offset="-12"
                    data-tooltip-horizontal-offset="0"
                >
                    cancel
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Tyler Lin
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Not here
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons yellow"
                    jscontroller="VXdfxd"
                    jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                    tabindex="0"
                    aria-label="Previously Present"
                    data-tooltip="Previously Present"
                    data-tooltip-vertical-offset="-12"
                    data-tooltip-horizontal-offset="0"
                >
                    watch_later
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Krishna
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Last seen: 10:00 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons gray"
                    jscontroller="VXdfxd"
                    jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                    tabindex="0"
                    aria-label="Unlisted"
                    data-tooltip="Unlisted"
                    data-tooltip-vertical-offset="-12"
                    data-tooltip-horizontal-offset="0"
                >
                    error
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Xiao
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here: 10:05 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons green"
                    data-md-tooltip="Present Now"
                >
                    check_circle
                </span>
                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Aditya Balasubramanian
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here 10:02 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons red"
                >
                    cancel
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Tyler Lin
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Not here
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons yellow"
                >
                    watch_later
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Krishna
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Last seen: 10:00 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons gray"
                >
                    error
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Xiao
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here: 10:05 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons green"
                    data-md-tooltip="Present Now"
                >
                    check_circle
                </span>
                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Aditya Balasubramanian
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here 10:02 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons red"
                >
                    cancel
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Tyler Lin
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Not here
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons yellow"
                >
                    watch_later
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Krishna
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Last seen: 10:00 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons gray"
                >
                    error
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Xiao
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here: 10:05 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons green"
                    data-md-tooltip="Present Now"
                >
                    check_circle
                </span>
                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Aditya Balasubramanian
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here 10:02 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons red"
                >
                    cancel
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Tyler Lin
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Not here
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons yellow"
                >
                    watch_later
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Krishna
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Last seen: 10:00 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>

            <li class="mdc-list-item mdc-ripple-surface" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons gray"
                >
                    error
                </span>

                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        Xiao
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        Here: 10:05 PM
                    </span>
                </span>
            </li>
            <li class="mdc-list-divider" role="separator"></li>
        </ul>
    </div>
    <div class="mdc-list-divider" role="separator"></div>
    <div class="mdc-card__actions">
        <button class="mdc-button mdc-ripple-surface mdc-button--raised mdc-card__action mdc-card__action--button" id="export">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Export</span>
        </button>
        <div role="progressbar" class="mdc-linear-progress" aria-label="Export progress" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0">
            <div class="mdc-linear-progress__buffer">
                <div class="mdc-linear-progress__buffer-bar"></div>
                <div class="mdc-linear-progress__buffer-dots"></div>
            </div>
            <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                <span class="mdc-linear-progress__bar-inner"></span>
            </div>
            <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                <span class="mdc-linear-progress__bar-inner"></span>
            </div>
        </div>
    </div>
</div>`

const selectDialogHTML = `<div class="mdc-dialog" id="select">
    <div class="mdc-dialog__container">
        <div
            class="mdc-dialog__surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-content"
        >
            <div>
                <h2 class="mdc-dialog__title" id="dialog-title">
                    Select class
                </h2>
                <button class="mdc-icon-button material-icons dialog-button right">
                    help_outline
                </button>
            </div>
            <div class="mdc-dialog__content" id="dialog-content">
                <ul class="mdc-list" id="class-list" role="listbox">
                    <li
                        class="mdc-list-item mdc-ripple-surface"
                        role="option"
                        tabindex="0"
                    >
                        <span class="mdc-list-item__ripple"></span>
                        <span
                            class="mdc-list-item__graphic material-icons"
                        >
                            perm_identity
                        </span>
                        <span class="mdc-list-item__text">
                            Period 1
                        </span>
                        <div class="mdc-list-item__meta">
                            <div class="mdc-menu-surface--anchor">
                                <div
                                    class="mdc-menu mdc-menu-surface"
                                    role="menu"
                                >
                                    <ul class="mdc-list">
                                        <li
                                            class="mdc-list-item mdc-ripple-surface"
                                            role="menuitem"
                                        >
                                            <span
                                                class="mdc-list-item__text"
                                                >Edit</span
                                            >
                                        </li>
                                        <li
                                            class="mdc-list-item mdc-ripple-surface"
                                            role="menuitem"
                                        >
                                            <span
                                                class="mdc-list-item__text"
                                                >Delete</span
                                            >
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                class="mdc-icon-button material-icons more"
                                aria-haspopup="menu"
                                aria-label="Select class options"
                            >
                                more_vert
                            </button>
                        </div>
                    </li>
                    <li
                        class="mdc-list-item mdc-ripple-surface"
                        role="option"
                    >
                        <span class="mdc-list-item__ripple"></span>
                        <span
                            class="mdc-list-item__graphic material-icons"
                        >
                            perm_identity
                        </span>
                        <span class="mdc-list-item__text">
                            Period 2
                        </span>
                        <div class="mdc-list-item__meta">
                            <div class="mdc-menu-surface--anchor">
                                <div
                                    class="mdc-menu mdc-menu-surface"
                                    role="menu"
                                >
                                    <ul class="mdc-list">
                                        <li
                                            class="mdc-list-item mdc-ripple-surface"
                                            role="menuitem"
                                        >
                                            <span
                                                class="mdc-list-item__text"
                                                >Edit</span
                                            >
                                        </li>
                                        <li
                                            class="mdc-list-item mdc-ripple-surface"
                                            role="menuitem"
                                        >
                                            <span
                                                class="mdc-list-item__text"
                                                >Delete</span
                                            >
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                class="mdc-icon-button material-icons more"
                                aria-haspopup="menu"
                                aria-label="Select class options"
                            >
                                more_vert
                            </button>
                        </div>
                    </li>
                </ul>
                <button
                    class="mdc-button mdc-ripple-surface"
                    id="add-class"
                >
                    <div class="mdc-button__ripple"></div>
                    <i
                        class="material-icons mdc-button__icon"
                        aria-hidden="true"
                        >add</i
                    >
                    <span class="mdc-button__label">Add Class</span>
                </button>
            </div>
            <div class="mdc-dialog__actions">
                <button
                    type="button"
                    class="mdc-button mdc-button--outlined mdc-dialog__button"
                    data-mdc-dialog-action="close"
                >
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Later</span>
                </button>
                <button
                    type="button"
                    class="mdc-button mdc-button--outlined mdc-dialog__button"
                    id="select-button"
                    data-mdc-dialog-action="accept"
                    disabled
                >
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Select</span>
                </button>
            </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>`

const buttonHTML = `<div id="attendance" jsshadow="" role="button" class="uArJ5e UQuaGc kCyAyd kW31ib foXzLb IeuGXd M9Bg4d" jscontroller="VXdfxd" jsaction="mouseenter:tfO1Yc; mouseleave:JywGue; focus:AHmuwe; blur:O22p3e; contextmenu:mg9Pef" jsname="VyLmyb" aria-label="Take attendance" aria-disabled="false" tabindex="0" data-tooltip="Take attendance" aria-expanded="true" data-tab-id="0" data-tooltip-vertical-offset="-12" data-tooltip-horizontal-offset="0">
<div class="Fvio9d MbhUzd" jsname="ksKsZd"></div>
<div class="e19J0b CeoRYc"></div>
<span jsslot="" class="l4V7wb Fxmcue">
    <span class="NPEfkd RveJvd snByac">
        <div class="ZaI3hb" style="margin:0 15px 0 17px">
            <div class="gV3Svc">
                <span class="DPvwYc sm8sCf azXnTb" aria-hidden="true">
                    <svg focusable="false" width="24" height="24" viewBox="0 0 24 24" class="Hdh4hc cIGbvc NMm5M">
                        <path d=" M 14.077 10.154 C 13.974 10.15 12.031 10.126 10.385 10.154 C 6.34 10.213 5.521 8.044 5.462 4 L 3 4 C 3.066 8.658 3.886 11.65 7.923 12.615 L 7.923 20 L 15.308 20 L 15.308 13.846 C 16.145 15.082 16.486 16.997 16.538 20 L 19 20 C 18.94 15.412 18.193 10.185 14.077 10.162 L 14.077 10.154 Z  M 9.154 6.462 C 9.154 5.102 10.257 4 11.615 4 C 12.974 4 14.077 5.102 14.077 6.462 C 14.077 7.82 12.974 8.923 11.615 8.923 C 10.257 8.923 9.154 7.82 9.154 6.462 L 9.154 6.462 L 9.154 6.462 Z " fill-rule="evenodd"/>
                    </svg>
                </span>
            </div>
        </div>
    </span>
</span>
</div>
<div class="qO3Z3c"></div>`

const snackbarHTML = `<div class="mdc-snackbar">
    <div class="mdc-snackbar__surface">
    <div class="mdc-snackbar__label"
        role="status"
        aria-live="polite">
        An error occurred. Please try again later.
    </div>
    <div class="mdc-snackbar__actions">
        <button type="button" class="mdc-button mdc-snackbar__action" id="retry">
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">Retry</span>
        </button>
    </div>
    </div>
</div>`