const expectedNames = ["Aditya Balasubramanian", "Tyler Lin"];

function storeNames(names, expectedNames) {
    chrome.storage.local.get("attendance", function (result) {
        // let currentData = result.attendance;
        // let newEntry = {};
        // for (const name of expectedNames) {
        //     newEntry[name] = names.includes(name);
        // }
        // const timestamp = ~~(Date.now() / 1000);
        // currentData[timestamp] = newEntry;
        // chrome.storage.local.set({ 'attendance': currentData });

        let currentData = result.attendance;
        if (currentData == undefined) {
            currentData = {};
        }
        
        const timestamp = ~~(Date.now() / 1000);
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
        chrome.storage.local.set({ "attendance": currentData });
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
    const numAttendees = parseInt(document.querySelector("[jsname='EydYod']").textContent.slice(1, -1)) - 1;
    let names = [];
    getVisibleAttendees(container, names);
    while (names.length < numAttendees) {
        setTimeout(function () {
            getVisibleAttendees(container, names);
        }, 100);
    }
    container.scrollTop = 0;
    storeNames(names, ['Tyler Lin', 'Aditya Balasubramanian']);
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
        document.getElementsByClassName("gV3Svc")[0].click();
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
    if (document.getElementsByClassName("cS7aqe NkoVdd")[0]) {
        takeAttendance();
        me.disconnect();
    }
});

const listObserver = new MutationObserver(function (mutations, me) {
    takeAttendance();
    me.disconnect();
})


const readyObserver = new MutationObserver(function (mutations, me) {
    if (document.getElementsByClassName("wnPUne N0PJ8e")[0]) {
        const app = document.createElement("div");
        app.setAttribute("id", "attendance");
        app.innerHTML = `<span id="merge" aria-hidden="true"> <svg class="svg" focusable="false" width="24" height="24" viewBox="0 0 24 24" width="24">
        <path d="M10,12c2.21,0,4-1.79,4-4c0-2.21-1.79-4-4-4S6,5.79,6,8C6,10.21,7.79,12,10,12z M10,6c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2 S8,9.1,8,8C8,6.9,8.9,6,10,6z" />
        <path d="M4,18c0.22-0.72,3.31-2,6-2c0-0.7,0.13-1.37,0.35-1.99C7.62,13.91,2,15.27,2,18v2h9.54c-0.52-0.58-0.93-1.25-1.19-2H4z" />
        <path d="M19.43,18.02C19.79,17.43,20,16.74,20,16c0-2.21-1.79-4-4-4s-4,1.79-4,4c0,2.21,1.79,4,4,4c0.74,0,1.43-0.22,2.02-0.57 c0.93,0.93,1.62,1.62,2.57,2.57L22,20.59C20.5,19.09,21.21,19.79,19.43,18.02z M16,18c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2s2,0.9,2,2 C18,17.1,17.1,18,16,18z" /></svg> </span>
        <div class="hover_button"> <span class="helper"> </span>
        <div>
            <div class="popupCloseButton">&times; </div>
            <p>HELP ME HARVEY</p>
        </div>
        </div>`;
    document.getElementsByClassName("NzPR9b")[0].prepend(app);

    injectScript(chrome.runtime.getURL("css/style.css"), "link", "head");
    injectScript(chrome.runtime.getURL("js/script.js"), "script", "html");
        peopleObserver.observe(document.getElementsByClassName("wnPUne N0PJ8e")[0], {
            childList: true,
        });

        me.disconnect();
    }
})

readyObserver.observe(document.getElementsByClassName("crqnQb")[0], {
    childList: true,
    subtree: true
})