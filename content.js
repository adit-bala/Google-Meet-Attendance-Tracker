chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message == "take-attendance") {
            let container = document.getElementsByClassName("HALYaf tmIkuc s2gQvd KKjvXb")[0];
            if (container) {
                takeAttendance(container);
            } else {
                document.getElementsByClassName("gV3Svc")[0].click();
                const target = document.getElementsByClassName("mKBhCf")[0];
                observer.observe(target, {
                    childList: true,
                    subtree: true
                });
            }
            sendResponse({ "message": "heard" });
        }
    });

function takeAttendance(container) {
    const numAttendees = parseInt(document.querySelector("[jsname='EydYod']").textContent.slice(1, -1)) - 1;
    let names = [];
    container.scrollTop = 0;
    getVisibleAttendees(container, names);
    setTimeout(function () {
        if (names.length < numAttendees) {
            getVisibleAttendees(container, names);
        }
        if (names.length === numAttendees) {
            container.scrollTop = 0;
            alert(names);
        }
    }, 500);
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

const observer = new MutationObserver(function (mutations, me) {
    let container = document.getElementsByClassName("HALYaf tmIkuc s2gQvd KKjvXb")[0];
    if (document.getElementsByClassName("cS7aqe NkoVdd")[1]) {
        takeAttendance(container);
        me.disconnect();
    }
});

(async () => {
    // Wait until in call
    while (document.querySelector(".d7iDfe") !== null) {
        await new Promise((r) => setTimeout(r, 500));
    }
    const app = document.createElement("DIV");
    app.setAttribute("id", "attendance");
    app.innerHTML = '<button type="button">Click Me!</button>';
    document.body.prepend(app);
})();