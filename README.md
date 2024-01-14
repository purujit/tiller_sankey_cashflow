# Tiller Cash flow Sankey
Apps Script code to generate a Sankey chart for cash flow based on your transactions in the Google Sheets Tiller Foundation Template.

![Cash Flow](screenshot.png?raw=true "Demo chart")

## About
- This is a script that is desined to work with the Tiller finance product to generate a Sankey cash flow chart.
- It looks up transactions, transaction categories and account categories to group transactions into inflow, savings and expenses and builds a Sankey chart with the data.
- Any and all feedback about how it's working (or not) is greatly appreciated.
- Feel free to fork and send a PR if you spot a bug or improvement.
- Please star the repo if you find it useful.

## Installation Instructions
- Clone this repo locally.
- Create an Apps Script project from your Google Sheet by going to "Extensions" -> "Apps Script". The URL should look like "https://script.google.com/u/0/home/projects/script_id/edit"
- Install Clasp and [clone](https://developers.google.com/apps-script/guides/clasp#clone_an_existing_project) the project from the previous step.
- Run `clasp push` on your local machine from the repo base path.

## Usage Instructions
- After installing the script, refresh your Tiller sheet.  You should see a new menu item appear called "Cash Flow" after a few seconds.

## License
This software is licensed under Apache License 2.0