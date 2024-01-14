function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Cash Flow')
        .addItem('Cash Flow Sankey', 'userActionShowCashFlowChart')
        .addToUi();
}

function userActionShowCashFlowChart() {
    const template = HtmlService.createTemplateFromFile('sankey_chart_ui');
    SpreadsheetApp.getUi().showModalDialog(template.evaluate().setWidth(600).setHeight(1350)
        , 'Cash Flow');
}