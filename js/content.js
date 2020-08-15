const expectedNames = ["Aditya Balasubramanian", "Tyler Lin"];

function storeNames(names, expectedNames) {
    const code = getMeetCode();
    chrome.storage.local.get(code, function (result) {
        // let currentData = result.attendance;
        // let newEntry = {};
        // for (const name of expectedNames) {
        //     newEntry[name] = names.includes(name);
        // }
        // const timestamp = ~~(Date.now() / 1000);
        // currentData[timestamp] = newEntry;
        // chrome.storage.local.set({ 'attendance': currentData });

        let res = result[code];
        if (res == undefined) {
            res = {
                "attendance": {},
                "class": "Period 1"
            };
        }
        let currentData = res.attendance;

        const timestamp = ~~(Date.now() / 1000);
        res.timestamp = timestamp;
        for (const name of expectedNames) {
            if (currentData[name] == undefined) {
                currentData[name] = [];
            }
            if (names.includes(name)) {
                if (currentData[name].length % 2 === 0) {
                    currentData[name].push(timestamp);
                }
            } else {
                if (currentData[name].length % 2 === 1) {
                    currentData[name].push(timestamp);
                }
            }
        }
        chrome.storage.local.set({ [code]: res });
    })
}

function getVisibleAttendees(container, names) {
    const labels = document.getElementsByClassName("cS7aqe NkoVdd");
    for (const label of labels) {
        const name = label.innerHTML;
        if (!names.includes(name) && name.slice(-6) !== " (You)") {
            names.push(name);
        }
    }
    container.scrollTop = 56 * names.length;
}

function takeAttendance() {
    const container = document.getElementsByClassName("HALYaf tmIkuc s2gQvd KKjvXb")[0];
    let lastNumNames = 0;
    let names = [];
    getVisibleAttendees(container, names);
    while (names.length !== lastNumNames) {
        lastNumNames = names.length;
        setTimeout(function () {
            getVisibleAttendees(container, names);
        }, 100);
    }
    container.scrollTop = 0;
    storeNames(names, ['Tyler Lin', 'Aditya Balasubramanian']);
}

function getMeetCode() {
    return document.title.substring(7);
}

function injectScript(file_path, type = "script", tag = "html") {
    var node = document.getElementsByTagName(tag)[0];
    var tag_type = type == "link" ? "link" : "script";
    var script = document.createElement(tag_type);
    if (type == "script") {
        script.setAttribute("type", "text/javascript");
    } else if (type == "module") {
        script.setAttribute("type", "module");
    } else {
        script.setAttribute("rel", "stylesheet");
        script.setAttribute("media", "screen");
    }
    script.setAttribute(tag_type == "script" ? "src" : "href", file_path);
    node.appendChild(script);
}

const peopleObserver = new MutationObserver(function (mutations, me) {
    const container = document.getElementsByClassName("HALYaf tmIkuc s2gQvd KKjvXb")[0];
    if (!container) {
        document.getElementsByClassName("gV3Svc")[1].click();
        tabObserver.observe(document.getElementsByClassName("mKBhCf")[0], {
            childList: true,
            subtree: true
        });
    } else {
        listObserver.observe(document.getElementsByClassName("HALYaf tmIkuc s2gQvd KKjvXb")[0], {
            childList: true,
            subtree: true
        })
    }
})

const tabObserver = new MutationObserver(function (mutations, me) {
    const numAttendees = parseInt(document.querySelector("[jsname='EydYod']").textContent.slice(1, -1)) - 1;
    const names = document.getElementsByClassName("cS7aqe NkoVdd");
    if (numAttendees === 0) {
        takeAttendance();
        me.disconnect();
    } else {
        if (names[1] != undefined) {
            listObserver.observe(document.getElementsByClassName("HALYaf tmIkuc s2gQvd KKjvXb")[0], {
                childList: true,
                subtree: true
            })
            me.disconnect();
        }
    }
});

const listObserver = new MutationObserver(function (mutations, me) {
    takeAttendance();
    me.disconnect();
})


const readyObserver = new MutationObserver(function (mutations, me) {
    if (document.getElementsByClassName("wnPUne N0PJ8e")[0]) {
        const bar = document.getElementsByClassName("NzPR9b")[0];
        bar.insertAdjacentHTML('afterbegin',
            `<div id="attendance" jsshadow="" role="button" class="uArJ5e UQuaGc kCyAyd kW31ib foXzLb IeuGXd M9Bg4d" jscontroller="VXdfxd" mousedown:UX7yZ; mouseup:lbsD7e; mouseenter:tfO1Yc; mouseleave:JywGue;touchstart:p6p2H; touchmove:FwuNnf; touchend:yfqBxc(preventMouseEvents=true|preventDefault=true); touchcancel:JMtRjd;focus:AHmuwe; blur:O22p3e; contextmenu:mg9Pef" jsname="VyLmyb" aria-label="Show everyone" aria-disabled="false" tabindex="0" data-tooltip="Show everyone" aria-expanded="true" data-tab-id="1" data-tooltip-vertical-offset="-12" data-tooltip-horizontal-offset="0">
            <div class="Fvio9d MbhUzd" jsname="ksKsZd" style="top: 24px; left: 36px; width: 72px; height: 72px;"></div>
            <div class="e19J0b CeoRYc"></div>
            <span jsslot="" class="l4V7wb Fxmcue">
                <span class="NPEfkd RveJvd snByac">
                    <div class="ZaI3hb">
                        <div class="gV3Svc">
                            <span class="DPvwYc sm8sCf azXnTb" aria-hidden="true">
                                <svg focusable="false" width="24" height="24" viewBox="0 0 24 24" class="Hdh4hc cIGbvc NMm5M">
                                    <path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                </span>
            </span>
        </div>
        <div class="qO3Z3c"></div>`)

        injectScript(chrome.runtime.getURL("css/style.css"), "link", "head");
        injectScript(chrome.runtime.getURL("js/script.js"), "script", "html");
        peopleObserver.observe(document.getElementsByClassName("wnPUne N0PJ8e")[0], {
            childList: true,
        });

        document.getElementById("attendance").addEventListener("click", function () {
            chrome.runtime.sendMessage(
                {
                    data: "export",
                    code: getMeetCode(),
                }
            )
        })

        me.disconnect();
    }
})

readyObserver.observe(document.getElementsByClassName("crqnQb")[0], {
    childList: true,
    subtree: true
})