chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.data == "export") {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            chrome.storage.local.get(["spreadsheet-id", "class"], function (result) {
                const id = result["spreadsheet-id"];
                const code = message.code;
                const className = result.class;
                console.log("Meet code: " + code);
                if (id == undefined) {
                    createSpreadsheet(token, className, code);
                } else {
                    updateSpreadsheet(token, className, code, id);
                }
            })
        });
    }
});

function createSpreadsheet(token, className, code) {
    const body = {
        "properties": {
            "title": "Attendance for Google Meet"
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
    let requests = [];
    console.log("Creating new attendance spreadsheet...");
    fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        init)
        .then((response) => response.json())
        .then(function (data) {
            console.log(`Successfully created Attendance spreadsheet with id ${data.spreadsheetId}.`);
            chrome.storage.local.set({ "spreadsheet-id": data.spreadsheetId });
            spreadsheetId = data.spreadsheetId;

            requests.push(createUpdateSheetPropertiesRequest(className, 0));
            requests.push(createHeadersRequest(0));
            return createFirstAppendCellsRequest(code, 0);
        })
        .then(function (reqs) {
            requests.push(reqs[0]);
            requests.push(reqs[1]);
            return batchUpdate(token, requests, spreadsheetId);
        })
        .then(function (data) {
            console.log("Create spreadsheet response:");
            console.log(data);
        })
}

function updateSpreadsheet(token, className, code, spreadsheetId) {
    let requests = [];
    let sheetId = null;
    let newSheet = false;
    console.log("Updating spreadsheet...");
    getSheetIdOfClass(token, className, spreadsheetId)
        .then(function (info) {
            sheetId = info[1];
            if (!info[0]) {
                requests.push(createAddSheetRequest(className, sheetId));
                console.log(`Creating new sheet for class ${className}, ID ${sheetId}`);
                requests.push(createHeadersRequest(sheetId));
                newSheet = true;
            }
            return getMeta(code);
        })
        .then(function (meta) {
            if (meta == undefined) {
                if (newSheet) {
                    return createFirstAppendCellsRequest(code, sheetId);
                }
                return createAppendCellsRequest(token, code, spreadsheetId, sheetId);
            }
            return createUpdateCellsRequest(code, sheetId, meta.startRow)
        })
        .then(function (reqs) {
            for (const request of reqs) {
                requests.push(request);
            }
            return batchUpdate(token, requests, spreadsheetId);
        })
        .then(function (data) {
            console.log("Update spreadsheet response:");
            console.log(data);
        })
}

function createUpdateSheetPropertiesRequest(className, sheetId) {
    const request =
    {
        "updateSheetProperties": {
            "properties": {
                "sheetId": sheetId,
                "title": className,
                "gridProperties": {
                    "rowCount": 2,
                    "columnCount": 6,
                    "frozenRowCount": 1
                }
            },
            "fields": "*"
        }
    };
    return request;
}

function createAddSheetRequest(className, sheetId) {
    const request =
    {
        "addSheet": {
            "properties": {
                "sheetId": sheetId,
                "title": className,
                "gridProperties": {
                    "rowCount": 2,
                    "columnCount": 6,
                    "frozenRowCount": 1
                }
            }
        }
    };
    return request;
}

function createHeadersRequest(sheetId) {
    let headers = ["Name", "Present", "Time In", "Time Out", "# of Joins", "Mins. Present"];
    const request = {
        "updateCells": {
            "rows": {
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
            },
            "fields": "*",
            "start": {
                "sheetId": sheetId,
                "rowIndex": 0,
                "columnIndex": 0
            }
        },
    };
    return request;
}

function createAppendCellsRequest(token, code, spreadsheetId, sheetId) {
    sheetId = parseInt(sheetId);
    return new Promise(resolve => {
        let numRows = null;
        getNumRows(token, spreadsheetId, sheetId)
            .then(function (rows) {
                numRows = rows;
                return generateAttendanceRows(code, numRows);
            })
            .then(function (rowData) {
                const requests = [
                    {
                        "appendCells": {
                            "sheetId": sheetId,
                            "rows": rowData,
                            "fields": "*"
                        }
                    },
                    {
                        "mergeCells": {
                            "range": {
                                "sheetId": sheetId,
                                "startRowIndex": numRows,
                                "endRowIndex": numRows + 1,
                                "startColumnIndex": 0,
                                "endColumnIndex": 6
                            },
                            "mergeType": 'MERGE_ALL'
                        }
                    }
                ]
                resolve(requests);
            })
    })
}

function createFirstAppendCellsRequest(code, sheetId) {
    sheetId = parseInt(sheetId);
    return new Promise(resolve => {
        generateAttendanceRows(code, 1)
            .then(function (rowData) {
                const requests = [
                    {
                        "appendCells": {
                            "sheetId": sheetId,
                            "rows": rowData,
                            "fields": "*"
                        }
                    },
                    {
                        "mergeCells": {
                            "range": {
                                "sheetId": sheetId,
                                "startRowIndex": 1,
                                "endRowIndex": 2,
                                "startColumnIndex": 0,
                                "endColumnIndex": 6
                            },
                            "mergeType": 'MERGE_ALL'
                        }
                    }
                ]
                resolve(requests);
            })
    })
}

function createUpdateCellsRequest(code, sheetId, startRow) {
    sheetId = parseInt(sheetId);
    return new Promise(resolve => {
        generateAttendanceRows(code)
            .then(function (rowData) {
                const requests = [
                    {
                        "updateCells": {
                            "rows": rowData,
                            "fields": "*",
                            "start": {
                                "sheetId": sheetId,
                                "rowIndex": startRow,
                                "columnIndex": 0
                            }
                        }
                    }]
                resolve(requests);
            })
    })
}

function generateAttendanceRows(code, startRow = undefined) {
    return new Promise(resolve => {
        chrome.storage.local.get(code, function (result) {
            const unix = ~~(Date.now() / 1000);
            const rawData = result[code].attendance;
            let rowData = [
                {
                    "values": [
                        {
                            "userEnteredValue": {
                                "stringValue": `${code} — ${dateTimeString(unix)}`
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
            ];
            for (const name in rawData) {
                let present = "N", timeIn = "", timeOut = "", joins = 0, minsPresent = 0;
                const timestamps = rawData[name];
                const l = timestamps.length;
                if (l > 0) {
                    present = "Y";
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
                                    "red": present === "N" ? 1 : 0.5,
                                    "green": present === "N" ? 0.5 : 1,
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
            rowData.push({
                "values": [
                    {
                        "userEnteredValue": {
                            "stringValue": ""
                        }
                    }
                ]
            })

            if (startRow != undefined) {
                result[code].meta = {
                    "startRow": startRow,
                    "endRow": startRow + rowData.length
                };
                chrome.storage.local.set({ [code]: result[code] });
            }

            resolve(rowData);
        })
    })
}

function getSheetIdOfClass(token, className, spreadsheetId) {
    console.log(`Fetching sheet ID of class ${className}...`)
    return new Promise(resolve => {
        const init = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };
        fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
            init)
            .then((response) => response.json())
            .then(function (data) {
                for (const sheet of data.sheets) {
                    if (sheet.properties.title === className) {
                        resolve([true, sheet.properties.sheetId]);
                    }
                }
                resolve([false, data.sheets.length]);
            })
    })
}

function getNumRows(token, spreadsheetId, sheetId) {
    console.log(`Getting number of rows in sheet ID ${sheetId}...`)
    return new Promise(resolve => {
        const body = {
            "dataFilters": {
                "gridRange": {
                    "sheetId": sheetId
                }
            },
            "includeGridData": true
        }
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
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:getByDataFilter`,
            init)
            .then((response) => response.json())
            .then(function (data) {
                console.log(data);
                resolve(data.sheets[0].properties.gridProperties.rowCount);
            })
    })
}

function getMeta(code) {
    return new Promise(resolve => {
        chrome.storage.local.get(code, function (result) {
            resolve(result[code].meta);
        })
    })
}

function batchUpdate(token, requests, spreadsheetId) {
    console.log("Executing batch update...");
    console.log(requests);
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