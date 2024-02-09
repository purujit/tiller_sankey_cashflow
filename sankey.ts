interface CashFlowEdge {
    source: string;
    amount: number;
}

interface CashFlowData {
    income: CashFlowEdge[];
    expense: CashFlowEdge[];
    savings: CashFlowEdge[];
}

function getCashFlowData(fromDateString: string, toDateString: string): CashFlowData {
    const fromDate = new Date(fromDateString);
    const toDate = new Date(toDateString);

    const categories = getCategories();
    const incomeCategories = categories.filter(c => c.type === "Income").map(c => c.category);
    const expenseCategories = categories.filter(c => c.type === "Expense").map(c => c.category);

    const accounts = getAccounts();
    const accountToGroup = accounts.reduce((acc, curr) => {
        // Parse the Tiller account id that appears as a suffic like " -  (E0A8)".
        const tillerAccountId = curr.account.substring(curr.account.length - 5, curr.account.length - 1).toLowerCase();
        acc[tillerAccountId] = curr.group;
        return acc;
    }, {});

    const transactions = getTransactions(fromDate, toDate);
    const income: CashFlowEdge[] = [];
    const expense: CashFlowEdge[] = [];
    const savings: CashFlowEdge[] = [];
    const categoryTotals: { [key: string]: number } = {};
    const savingsTotalsByAccount: { [key: string]: number } = {};
    for (const transaction of transactions) {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        const tillerAccountId = transaction.account.substring(transaction.account.length - 4).toLowerCase();
        if (SAVINGS_TRANSACTIONS.includes(transaction.category)) {
            savingsTotalsByAccount[tillerAccountId] = (savingsTotalsByAccount[tillerAccountId] || 0) + transaction.amount;
        }
    }
    for (const source in categoryTotals) {
        const amount = categoryTotals[source];
        if (incomeCategories.includes(source)) {
            income.push({ source, amount });
        }
        if (expenseCategories.includes(source)) {
            expense.push({ source, amount });
        }
    }
    const savingsByGroup: { [key: string]: number } = {};
    for (const source in savingsTotalsByAccount) {
        const amount = savingsTotalsByAccount[source];
        const group = accountToGroup[source];
        if (SAVINGS_ACCOUNT_GROUPS.includes(group)) {
            savingsByGroup[group] = (savingsByGroup[group] || 0) + amount;
        }
    }
    for (const source in savingsByGroup) {
        savings.push({ source, amount: savingsByGroup[source] });
    }

    var dumpData = false;
    if (dumpData === true) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var col = 1;
        for (const edgeType of [income, expense, savings]) {
            const sources = edgeType.map(e => e.source);
            const amounts = edgeType.map(e => e.amount);
            const sourcesRange = sheet.getRange(1, col, sources.length, 1);
            // Create an 2D array with sources.length rows and 1 column.
            var sourcesArray = sources.map(s => [s]);
            sourcesRange.setValues(sourcesArray);
            col += 1;
            const amountsRange = sheet.getRange(1, col, amounts.length, 1);
            var amountsArray = amounts.map(a => [a]);
            amountsRange.setValues(amountsArray);
            col += 1;
        }
    }

    return { income, expense, savings };
}

interface ShortTransaction {
    category: string;
    amount: number;
    account: string;
}

const getTransactions = (fromDate: Date, toDate: Date): ShortTransaction[] => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TRANSACTION_SHEET_NAME);
    if (sheet === null) {
        throw new Error("Could not find sheet '" + TRANSACTION_SHEET_NAME + "' in your spreadsheet");
    }
    const headers = sheet.getRange("1:1").getValues()[0];
    const categoryColLetter = getColumnLetterFromColumnHeader(headers, CATEGORY_COL_NAME);
    const amountColLetter = getColumnLetterFromColumnHeader(headers, AMOUNT_COL_NAME);
    const dateColLetter = getColumnLetterFromColumnHeader(headers, DATE_COL_NAME);
    const accountColLetter = getColumnLetterFromColumnHeader(headers, ACCOUNT_ID_COL_NAME);
    const lastColLetter = getColumnLetterFromColumnHeader(headers, headers[headers.length - 1]);

    const fromDateString = Utilities.formatDate(fromDate, "UTC", "yyyy-MM-dd");
    const toDateString = Utilities.formatDate(toDate, "UTC", "yyyy-MM-dd");

    const cols = [categoryColLetter, amountColLetter, accountColLetter];
    var colsStr = cols.join(",");

    const queryString = `SELECT ${colsStr} WHERE ${categoryColLetter} is not null AND ${dateColLetter} >= date '${fromDateString}' AND ${dateColLetter} <= date '${toDateString}'`;
    Logger.log(`Querying spreadsheet with query: ${queryString}`);
    const transactions = gvizQuery(
        SpreadsheetApp.getActiveSpreadsheet().getId(),
        queryString,
        TRANSACTION_SHEET_NAME,
        "A:" + lastColLetter
    ).map((row) => {
        return {
            category: row[0],
            amount: row[1],
            account: row[2],
        };
    });
    return transactions;
}

interface Category {
    category: string;
    group: string;
    type?: "Income" | "Expense" | "Transfer";
}

const getCategories = (): Category[] => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CATEGORY_SHEET_NAME);
    if (sheet === null) {
        throw new Error("Could not find sheet '" + CATEGORY_SHEET_NAME + "' in your spreadsheet");
    }
    const headers = sheet.getRange("1:1").getValues()[0];
    const categoryColLetter = getColumnLetterFromColumnHeader(headers, CATEGORY_COL_NAME);
    const groupColLetter = getColumnLetterFromColumnHeader(headers, GROUP_COL_NAME);
    const typeColLetter = getColumnLetterFromColumnHeader(headers, TYPE_COL_NAME);

    const lastColLetter = getColumnLetterFromColumnHeader(headers, headers[headers.length - 1]);
    const cols = [categoryColLetter, groupColLetter, typeColLetter];
    var colsStr = cols.join(",");
    const queryString = `SELECT ${colsStr} WHERE ${categoryColLetter} is not null`;
    Logger.log(`Querying spreadsheet with query: ${queryString}`);
    const categories = gvizQuery(
        SpreadsheetApp.getActiveSpreadsheet().getId(),
        queryString,
        CATEGORY_SHEET_NAME,
        "A:" + lastColLetter
    ).map((row) => {
        return {
            category: row[0],
            group: row[1],
            type: ["Income", "Expense", "Transfer"].includes(row[2]) ? row[2] : undefined,
        };
    });
    return categories;
}

interface Account {
    account: string;
    group: string;
}

const getAccounts = (): Account[] => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACCOUNT_SHEET_NAME);
    if (sheet === null) {
        throw new Error("Could not find sheet '" + ACCOUNT_SHEET_NAME + "' in your spreadsheet");
    }
    const headers = sheet.getRange("1:1").getValues()[0];
    const accountColLetter = getColumnLetterFromColumnHeader(headers, ACCOUNT_COL_NAME);
    const groupColLetter = getColumnLetterFromColumnHeader(headers, GROUP_COL_NAME);

    const lastColLetter = getColumnLetterFromColumnHeader(headers, headers[headers.length - 1]);
    const cols = [accountColLetter, groupColLetter];
    var colsStr = cols.join(",");
    const queryString = `SELECT ${colsStr} WHERE ${accountColLetter} is not null and ${groupColLetter} is not null`;
    Logger.log(`Querying spreadsheet with query: ${queryString}`);

    const accounts = gvizQuery(
        SpreadsheetApp.getActiveSpreadsheet().getId(),
        queryString,
        ACCOUNT_SHEET_NAME,
        "A:" + lastColLetter
    ).map((row) => {
        return {
            account: row[0],
            group: row[1],
        };
    });
    return accounts;
}
