chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.data == "export") {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            const data = {
                "properties": {
                    "title": "Attendance"
                }
            };
            const init = {
                method: 'POST',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };
            fetch(
                'https://sheets.googleapis.com/v4/spreadsheets',
                init)
                .then((response) => response.json())
                .then(function (data) {
                    console.log(data)
                });
        });
    }
});