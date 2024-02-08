function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Cash Flow')
        .addItem('Cash Flow Sankey', 'userActionShowCashFlowChart')
        .addToUi();
}

function userActionShowCashFlowChart() {
    const template = HtmlService.createTemplateFromFile('sankey_chart_ui');
    // Google sheets gives us no way of knowing how big the screen is. Otherwise, we could
    // have used the total screen size to compute a reasonable size for the dialog.
    // This 640x640 should work for most desktop screens.
    // See https://stackoverflow.com/questions/25293568/how-to-determine-google-sheets-window-size
    SpreadsheetApp.getUi().showModalDialog(template.evaluate().setWidth(640).setHeight(640)
        , 'Cash Flow');
}
