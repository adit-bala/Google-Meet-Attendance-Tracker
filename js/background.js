chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.data == "export") {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            chrome.storage.local.get("spreadsheet-id", function (result) {
                id = result["spreadsheet-id"];
                code = message.code;
                console.log("Meet code: " + code);
                if (id == undefined) {
                    createSpreadsheet(token, code);
                } else {
                    updateSpreadsheet(token, code, id);
                }
            })
        });
    }
});

function createSpreadsheet(token, code) {
    const body = {
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
    let spreadsheetId = null;
    fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        init)
        .then((response) => response.json())
        .then(function (data) {
            console.log(`Successfully created Attendance spreadsheet with id ${data.spreadsheetId}.`);
            console.log(data);
            chrome.storage.local.set({ "spreadsheet-id": data.spreadsheetId });
            spreadsheetId = data.spreadsheetId;

            return createUpdateCellsRequest(code, 0);
        })
        .then(function (updateCellsRequest) {
            const requests = [
                {
                    "updateSheetProperties": {
                        "properties": {
                            "sheetId": 0,
                            "title": code,
                            "gridProperties": {
                                "rowCount": 100,
                                "columnCount": 100,
                                "frozenRowCount": 2
                            }
                        },
                        "fields": "*"
                    },
                },
                {
                    "updateCells": updateCellsRequest.updateCells,
                },
                {
                    "mergeCells": updateCellsRequest.mergeCells
                }
            ];
            return batchUpdate(token, requests, spreadsheetId);
        })
        .then(function (data) {
            console.log("Create spreadsheet response:");
            console.log(data);
        })
}

function updateSpreadsheet(token, code, spreadsheetId) {
    let sheetId = null;
    let newSheet = false;
    getMeetCodesArray(token, spreadsheetId)
        .then(function (array) {
            sheetId = array.indexOf(code);
            if (sheetId === -1) {
                sheetId = array.length;
                newSheet = true;
                console.log(`Creating new sheet with ID ${sheetId} (code ${code})`);
            } else {
                console.log(`Updating sheet with ID ${sheetId} (code ${code})`)
            }
            return createUpdateCellsRequest(code, sheetId);
        })
        .then(function (updateCellsRequest) {
            let requests = [
                {
                    "updateCells": updateCellsRequest.updateCells,
                }
            ]
            if (newSheet) {
                requests.unshift({
                    "addSheet": {
                        "properties": {
                            "sheetId": sheetId,
                            "title": code,
                            "gridProperties": {
                                "rowCount": 100,
                                "columnCount": 100,
                                "frozenRowCount": 2
                            }
                        }
                    }
                });
                requests.push({
                    "mergeCells": updateCellsRequest.mergeCells
                })
            }
            return batchUpdate(token, requests, spreadsheetId);
        })
        .then(function (data) {
            console.log("Update spreadsheet response:");
            console.log(data);
        })
}

function createUpdateCellsRequest(code, sheetId) {
    sheetId = parseInt(sheetId);
    return new Promise(resolve => {
        chrome.storage.local.get("attendance", function (result) {
            const unix = ~~(Date.now() / 1000);
            const rawData = result.attendance;
            let headers = ["Name", "Present", "Time In", "Time Out", "# of Joins", "Mins. Present"];
            let rowData = [
                {
                    "values": [
                        {
                            "userEnteredValue": {
                                "stringValue": `Attendance for meet ${code} — Recorded ${dateTimeString(unix)}`
                            },
                            "userEnteredFormat": {
                                "horizontalAlignment": 'CENTER',
                                "textFormat": {
                                    "bold": true,
                                }
                            }
                        }
                    ]
                },
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
            for (const name in rawData) {
                let present = "", timeIn = "", timeOut = "", joins = 0, minsPresent = 0;
                const timestamps = rawData[name];
                const l = timestamps.length;
                if (l > 0) {
                    present = "✓";
                    timeIn = toTimeString(timestamps[0]);
                    timeOut = toTimeString(timestamps[l - 1]);
                    joins = Math.ceil(l / 2);
                    for (let i = 0; i < l; i += 2) {
                        let secs;
                        if (i + 1 === l) {
                            secs = unix - timestamps[i];
                        } else {
                            secs = timestamps[i + 1] - timestamps[i];
                        }
                        const mins = Math.round(secs / 6) / 10;
                        minsPresent += mins;
                    }
                }
                rowData.push({
                    "values": [
                        {
                            "userEnteredValue": {
                                "stringValue": name
                            }
                        },
                        {
                            "userEnteredValue": {
                                "stringValue": present
                            },
                            "userEnteredFormat": {
                                "backgroundColor": {
                                    "red": present === "" ? 1 : 0.5,
                                    "green": present === "" ? 0.5 : 1,
                                    "blue": 0.5,
                                    "alpha": 1
                                },
                                "textFormat": {
                                    "bold": true
                                }
                            }
                        },
                        {
                            "userEnteredValue": {
                                "stringValue": timeIn
                            }
                        },
                        {
                            "userEnteredValue": {
                                "stringValue": timeOut
                            }
                        },
                        {
                            "userEnteredValue": {
                                "numberValue": joins
                            }
                        },
                        {
                            "userEnteredValue": {
                                "numberValue": minsPresent
                            }
                        }
                    ]
                })
            }
            const request =
            {
                "updateCells": {
                    "rows": rowData,
                    "fields": "*",
                    "start": {
                        "sheetId": sheetId,
                        "rowIndex": 0,
                        "columnIndex": 0
                    }
                },
                "mergeCells": {
                    "range": {
                        "sheetId": sheetId,
                        "startRowIndex": 0,
                        "endRowIndex": 1,
                        "startColumnIndex": 0,
                        "endColumnIndex": 6
                    },
                    "mergeType": 'MERGE_ALL'
                }
            }
            resolve(request);
        })
    })
}

function batchUpdate(token, requests, spreadsheetId) {
    console.log("Executing batch update...");
    return new Promise(resolve => {
        const body = {
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
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            init)
            .then((response) => response.json())
            .then(function (data) {
                resolve(data);
            });
    })
}

function getMeetCodesArray(token, spreadsheetId) {
    return new Promise(resolve => {
        const init = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
        };
        fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
            init)
            .then((response) => response.json())
            .then(function (data) {
                resolve(data.sheets.map(sheet => sheet.properties.title));
            })
    })

}

function dateTimeString(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "timeStyle": "short",
        "dateStyle": "short"
    }).format(new Date(timestamp * 1000));
}

function toTimeString(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "timeStyle": "short",
    }).format(new Date(timestamp * 1000));
}   