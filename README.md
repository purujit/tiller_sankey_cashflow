# Tiller Cash flow Sankey
Apps Script code to generate a Sankey chart for cash flow based on your transactions in the Google Sheets Tiller Foundation Template.

![Cash Flow](screenshot.png?raw=true "Demo chart")

## About
- This is a script that is desined to work with the Tiller finance product to generate a Sankey cash flow chart.
- It looks up transactions, transaction categories and account categories to group transactions into inflow, savings and expenses and builds a Sankey chart with the data.
- Any and all feedback about how it's working (or not) is greatly appreciated.
- Feel free to fork and send a PR if you spot a bug or improvement.
- Please star the repo if you find it useful.

# Installation Instructions
- Find the "Releases" section on the right of the Github page and follow the link.
- Go to downloads and download `release.zip`.
- Unzip the file.
- Create an Apps Script project from your Google Sheet by going to "Extensions" -> "Apps Script". It should show you an Editor with some files in the left pane.
- Copy all the files from the release into your apps script project. Note that you'll need to replace the Code.gs file that is created by default and is empty with the one in the release.

## Installation from Source Instructions
- Install [`homebrew`](https://brew.sh/) if you don't have it already.
- Install `node`
    - From a terminal, 
    ```
    brew install node
    ```
- Install [`clasp`](https://github.com/google/clasp)
    - From a terminal (you may have to close the terminal where you installed node and open a new terminal window),
    ```
    npm install -g @google/clasp
    ```
- Login to `clasp` in a terminal and follow the prompts.
```
clasp login
```
- Create an Apps Script project from your Google Sheet by going to "Extensions" -> "Apps Script". The URL should look like "https://script.google.com/u/0/home/projects/script_id/edit". Note this script_id in the URL. We'll use it in a following step.
- Clone this repo locally.
    - From a terminal,
    ```
    git clone https://github.com/purujit/tiller_sankey_cashflow.git
    ```
- From the same terminal. Use the script_id from the prior step.
```
cd tiller_sankey_cashflow
clasp clone <script_id_from_your_appscript_project>
clasp push -P
```
- Go back to your Apps Script project and if there are multiple `Code.js` files, delete the empty one. If both are non-empty, you probably already created another apps script and you already know what to do. 

## Usage Instructions
- After installing the script, refresh your Tiller sheet.  You should see a new menu item appear called "Cash Flow" after a few seconds.

## License
This software is licensed under Apache License 2.0