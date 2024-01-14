/**
 * Queries a spreadsheet using Google Visualization API's Datasoure Url.
 *
 * @param        {String} ssId    Spreadsheet ID.
 * @param        {String} query   Query string.
 * @param {String|Number} sheetId Sheet Id (gid if number, name if string). [OPTIONAL]
 * @param        {String} range   Range                                     [OPTIONAL]
 * @param        {Number} headers Header rows.                              [OPTIONAL]
 */
const gvizQuery = (ssId: string, query: string, sheetId: string, range: string, headers?: number): string[][] => {
  var rawResponse = UrlFetchApp
    .fetch(
      Utilities.formatString(
        "https://docs.google.com/spreadsheets/d/%s/gviz/tq?tq=%s%s%s%s",
        ssId,
        encodeURIComponent(query),
        "&sheet=" + sheetId,
        "&range=" + range,
        "&headers=" + headers ?? "0"
      ),
      {
        "headers": {
          "Authorization": "Bearer " + ScriptApp.getOAuthToken()
        }
      }
    )
    .getContentText()
    .replace("/*O_o*/\n", "") // remove JSONP wrapper
    .replace(/(google\.visualization\.Query\.setResponse\()|(\);)/gm, "") // remove JSONP wrapper

  // Logger.log("Response from Query: " + rawResponse);
  var response = JSON.parse(rawResponse);

  var table = response.table;
  var rows;

  if (headers !== undefined) {
    rows = table.rows.map(function (row) {
      return table.cols.reduce(
        function (acc, col, colIndex) {
          acc[col.label] = row.c[colIndex] && row.c[colIndex].v;
          return acc;
        },
        {}
      );
    });

  } else {
    rows = table.rows.map(function (row) {
      return row.c.reduce(
        function (acc, col) {
          acc.push(col && col.v);
          return acc;
        },
        []
      );
    });
  }

  return rows;

};


function getColumnLetterFromColumnHeader(columnHeaders, columnName) {
  var columnIndex = columnHeaders.indexOf(columnName);
  var columnLetter = "";

  let base = 26;
  let letterCharCodeBase = 'A'.charCodeAt(0);

  while (columnIndex >= 0) {
    columnLetter = String.fromCharCode(columnIndex % base + letterCharCodeBase) + columnLetter;
    columnIndex = Math.floor(columnIndex / base) - 1;
  }

  return columnLetter;
}