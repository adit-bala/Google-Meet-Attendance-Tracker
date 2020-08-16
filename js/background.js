chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.data == 'export') {
        const code = message.code
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            chrome.storage.local.get(['spreadsheet-id', code], function (
                result
            ) {
                const id = result['spreadsheet-id']
                const className = result[code].class
                console.log('Meet code: ' + code)
                if (id == undefined) {
                    createSpreadsheet(token, className, code)
                } else {
                    updateSpreadsheet(token, className, code, id)
                }
            })
        })
    }
})

function createSpreadsheet(token, className, code) {
    const body = {
        properties: {
            title: 'Attendance for Google Meet',
            spreadsheetTheme: getSpreadsheetTheme(),
        },
    }
    const init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }
    let spreadsheetId = null
    let requests = []
    console.log('Creating new attendance spreadsheet...')
    fetch('https://sheets.googleapis.com/v4/spreadsheets', init)
        .then((response) => response.json())
        .then(function (data) {
            console.log(
                `Successfully created Attendance spreadsheet with id ${data.spreadsheetId}.`
            )
            chrome.storage.local.set({ 'spreadsheet-id': data.spreadsheetId })
            spreadsheetId = data.spreadsheetId

            requests = requests.concat(
                createUpdateSheetPropertiesRequest(className, code, 0)
            )
            requests = requests.concat(createHeadersRequest(0))
            return createInitializeCellsRequest(code, 0)
        })
        .then(function (reqs) {
            requests = requests.concat(reqs)
            return batchUpdate(token, requests, spreadsheetId)
        })
        .then(function (data) {
            console.log('Initialize spreadsheet response:')
            console.log(data)
        })
}

async function updateSpreadsheet(token, className, code, spreadsheetId) {
    let requests = []
    let sheetId = null,
        startRow = null,
        numRows = null
    console.log('Updating spreadsheet...')
    getMetaByKey(className, token, spreadsheetId)
        .then(async function (meta) {
            if (meta == null) {
                const numSheets = await getNumSheets(token, spreadsheetId)
                sheetId = numSheets
                requests = requests.concat(
                    createAddSheetRequest(className, code, sheetId)
                )
                requests = requests.concat(createHeadersRequest(sheetId))
                console.log(
                    `Creating new sheet for class ${className}, ID ${sheetId}`
                )
                return getMetaByKey(code, token, spreadsheetId)
            } else {
                sheetId = meta.location.sheetId
                return getMetaByKey(code, token, spreadsheetId)
            }
        })
        .then(function (meta) {
            if (meta == null) {
                startRow = 1
                return createInitializeCellsRequest(code, sheetId)
            }
            startRow = meta.location.dimensionRange.startIndex
            numRows = parseInt(meta.metadataValue)
            return createUpdateCellsRequest(code, sheetId, startRow)
        })
        .then(function (reqs) {
            requests = requests.concat(reqs)
            return batchUpdate(token, requests, spreadsheetId)
        })
        .then(function (data) {
            console.log('Update spreadsheet response:')
            console.log(data)
            return createGroupRequest(
                token,
                className,
                code,
                spreadsheetId,
                sheetId
            )
        })
        .then(function (reqs) {
            requests = reqs
            return batchUpdate(token, requests, spreadsheetId)
        })
        .then(function (data) {
            console.log('Update metadata and groups response:')
            console.log(data)
        })
}
