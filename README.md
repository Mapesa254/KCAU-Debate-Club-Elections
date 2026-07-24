# KCAU Debate Club Elections 2026/27

This project provides an auditable election-results workflow for the KCAU Debate Club Elections 2026/27. It processes the official member register and ballot responses, produces transparent vote summaries, and presents the results through a dashboard and an analysis notebook.

## What the project does

- Cleans registration numbers and standardizes input data.
- Identifies duplicate member registrations and duplicate ballot submissions.
- Checks registration-number format and membership status.
- Calculates voter participation and turnout.
- Counts votes for each elective position and identifies winners, runner-ups, and margins of victory.
- Produces interactive charts for participation, turnout, and results by position.

The workflow uses aggregate reporting only. It is designed to support review without publishing how individual members voted.

## Project structure

| Path | Purpose |
| --- | --- |
| `Election_Data_Processing_Audit.ipynb` | Step-by-step audit notebook with data checks, results, and interactive charts. |
| `app.py` | Entry point for the Streamlit dashboard. |
| `data_processor.py` | Python data-cleaning and election-result calculations. |
| `charts.py` | Plotly chart definitions used by the dashboard. |
| `legacy/` | Static dashboard source and the script that prepares dashboard data. |
| `KCAU DEBATE CLUB MEMBERS.xlsx` | Official member register input. |
| `KCAU Debate Club Elections 2026_27 Ballot (Responses).xlsx` | Ballot-response input. |
| `requirements.txt` | Python dependencies. |

## Requirements

- Python 3.11 or later
- Node.js 18 or later (only needed when rebuilding the legacy dashboard data)

Install the Python dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run the analysis notebook

Open `Election_Data_Processing_Audit.ipynb` in Jupyter Notebook or VS Code, select the project virtual environment as the kernel, and run the cells from top to bottom.

The notebook includes separate interactive result charts for:

- President
- Vice President
- Secretary General
- Organising Secretary
- Publicity Secretary
- Finance Secretary

## Run the dashboard

From the project directory, activate the environment and run:

```powershell
streamlit run app.py
```

Streamlit will provide a local URL for the dashboard.

## Refresh dashboard data after changing the Excel files

The dashboard uses processed JSON data. After updating either Excel workbook, rebuild it from the `legacy` folder:

```powershell
cd legacy
npm install
npm run build-data
```

Then start the Streamlit app again.

## Data-handling rules

The audit and dashboard follow these rules:

1. Registration numbers are trimmed and normalized before comparison.
2. Duplicate member registrations retain the first occurrence.
3. Duplicate ballot submissions retain the first submission.
4. Registration numbers are checked against the expected `YY/NNNNN` format.
5. Ballots from registration numbers not present in the member register are flagged for review.
6. Results are calculated from aggregate counts; individual vote selections should not be shared outside the authorized election process.

## Notes

- Keep the two input Excel files in the project root unless you also update the file paths in the processing scripts.
- The derived year of study is an estimate based on the registration-number prefix.
- Before publishing results, the election committee should review any flagged duplicate, invalid, or non-member records.
