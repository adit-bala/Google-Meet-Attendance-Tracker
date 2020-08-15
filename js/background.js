chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.data == "export") {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            chrome.storage.local.get("spreadsheet-id", function (result) {
                id = result["spreadsheet-id"];
                if (id == undefined) {
                    createSpreadsheet(token);
                } else {
                    updateSpreadsheet(token, id);
                }
            })
        });
    }
});

async function createSpreadsheet(token) {
    let body = {
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
        body: JSON.stringify(body)
    };
    fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        init)
        .then((response) => response.json())
        .then(function (data) {
            console.log(`Successfully created Attendance spreadsheet with id ${data.spreadsheetId}.`);
            console.log(data);
            chrome.storage.local.set({ "spreadsheet-id": data.spreadsheetId });

            const date = new Date();
            const dateTime = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
            createUpdateCellsRequest(data.sheets[0].sheetId).then(function (updateCellsRequest) {
                console.log(updateCellsRequest);
                const requests = [
                    {
                        "updateSheetProperties": {
                            "properties": {
                                "title": dateTime,
                                "gridProperties": {
                                    "rowCount": 100,
                                    "columnCount": 100,
                                    "frozenRowCount": 1
                                }
                            },
                            "fields": "*"
                        },
                    },
                    {
                        "updateCells": updateCellsRequest
                    }
                ];
                body = {
                    "requests": requests,
                    "includeSpreadsheetInResponse": false
                };
                const init = {
                    method: 'POST',
                    async: true,
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                };
                fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}:batchUpdate`,
                    init)
                    .then((response) => response.json())
                    .then(function (data) {
                        console.log(data);
                    });
            });
        })
}

function createUpdateCellsRequest(sheetId) {
    return new Promise(resolve => {
        chrome.storage.local.get(["attendance", "spreadsheet-id"], function (result) {
            const rawData = result.attendance;
            let headers = ["Name", "Present", "Time In", "Time Out", "# of Joins", "Mins. Present"];
            const rowData = [
                {
                    "values": headers.map(function (header) {
                        return {
                            "userEnteredValue": {
                                "stringValue": header
                            },
                            "userEnteredFormat": {
                                "textFormat": {
                                    "bold": true,
                                }
                            }
                        }
                    })
                }
            ];
            const request = {
                "rows": rowData,
                "fields": "*",
                "start": {
                    "sheetId": parseInt(sheetId),
                    "rowIndex": 0,
                    "columnIndex": 0
                }
            }
            resolve(request);
        })
    })
}

function updateSheetWithRequests(token, sheetId, requests) {

}