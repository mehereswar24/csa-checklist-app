# Comprehensive Safety Audit (CSA) & PSM Gap Assessment Web Application

A full-fidelity, interactive web application replicating the Microsoft Excel **Comprehensive Safety Audit & Process Safety Management (PSM) Gap Assessment Checklist** (`CSA Checklist.xlsx`).

---

## 🌟 Features

- **Full Workbook Replication (22 Sheets, 670 Checkpoints)**:
  - **Cover Page**: Document metadata, Assessment Start/End dates, Auditor & Auditee rosters.
  - **Audit Team**: Unit, Location, Date, Formal Sign-off & Attendance logs.
  - **Summary Dashboard**: Live `=AVERAGE(C5:C23)` calculation, 5-tier Maturity Mapping (Level I to V) with active highlighting, Degree of Compliance criteria (0–4 scale), and interactive analytics.
  - **19 Audit Elements**:
    1. EHS Leadership & Commitment
    2. Employee Engagement
    3. Statutory Compliance & Standards
    4. Hazard Identification, Risk Assessment & Control (HIRA)
    5. Industrial Hygiene & Occupational Health (IH & OHS)
    6. Contractor Safety Management (CSM)
    7. Work Permit System (WPS) & LOTO
    8. Training, Awareness and Competency
    9. Process Safety Information (PSI)
    10. Process Hazard Analysis (PHA)
    11. Mechanical Integrity
    12. Management of Change (MOC)
    13. Pre-Startup Safety Review (PSSR)
    14. Workplace Hazards
    15. Chemical Hazards
    16. Fire & Explosion Hazards
    17. Electrical Safety
    18. Emergency Planning & Response
    19. Incident Reporting & Investigation

- **Excel-Style Interactive Resizable Tables**:
  - Drag-to-resize any column divider across all tables (Checklists, Summary, Cover, Audit Team).
  - Double-click any column boundary to reset to standard width.
  - "Reset Widths" button to restore default layout.
  - Column widths are remembered automatically in local storage.

- **Dynamic Excel Formulas & Instant Calculations**:
  - Real-time recalculation of `=SUM(...)` and `=Total / (Count * 4)` compliance percentages.
  - Summary Benchmark score automatically updates across all 19 elements in real time.

- **Collapsible Sidebar with Unique Topic Icons**:
  - Collapsible navigation drawer with search/filter for all 22 sheets.
  - Unique, domain-specific icons and colors for every single safety element.

- **Design System & Typography**:
  - Modern enterprise styling with Google Fonts: **Plus Jakarta Sans**, **Outfit**, and **Inter** paired with **JetBrains Mono**.
  - Interactive **Theme Switcher** with 4 curated palettes (*Modern Indigo & Slate*, *EHS Emerald Safety*, *Executive Azure Blue*, *Obsidian & Rose*).

- **Data Persistence & Excel Export**:
  - Auto-saves all progress in LocalStorage.
  - One-click **"Export Excel (.xlsx)"** button generating the full 22-sheet workbook with all updated values and formulas.
  - Print/PDF preview optimization.
  - "Reset to Original" to revert to original baseline numbers anytime.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mehereswar24/csa-checklist-app.git

# Navigate into project directory
cd csa-checklist-app

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development server
npm run dev

# Or build and run production server
npm run build
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React
- **Charts**: Chart.js + React-Chartjs-2
- **Excel Processing & Export**: SheetJS (xlsx)
