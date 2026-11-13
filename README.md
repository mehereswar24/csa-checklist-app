# Granules India Limited — EHS Maturity & Comprehensive Safety Audit (CSA)

Enterprise Environmental Health, Safety & Process Safety Management (PSM) Gap Assessment Web Application for **Granules India Limited**, benchmarking manufacturing facilities across **API Division (Units 1, 2, 4, 5)** and **Finished Dosage Division (GGP, GLS)**.

---

## 🌟 Key Capabilities

- **Enterprise Landing Page**:
  - 3-tier aggregated maturity benchmarking (Granules Org, API Cluster, FD Cluster).
  - Cross-Plant Performance Graph with automated data labels above each bar.
  - All Units 19 Elements Benchmark Matrix with Excel-style column resizing.
  - Scoring criteria rubric and 5-tier institutional maturity framework.

- **Comprehensive Safety Audit (CSA)**:
  - Unit-level assessment reports with baseline audit score, post-CAPA effective score, and maturity tier.
  - Dual bar/radar compliance profiles with automated top-bar score labels.
  - 19 elements element-by-element breakdown with live action tracking.
  - Cover page, audit team rosters, and attendance records.

- **Dedicated Multi-Unit Interactive Analytics**:
  - 6 units side-by-side element-wise compliance comparison.
  - Automated vertical score indicators on top of every bar.
  - Matrix table comparing post-CAPA and baseline compliance across all plants.

- **19 EHS Checklist Modules**:
  - Full-fidelity evaluation checklists for each of the 19 process safety elements.
  - Spacious visible areas (`min-h-[96px]`) for observations, auditor recommendations, and CAPA actions.
  - Fluid, fixed-width Excel-style column resizing and double-click column reset.

---

## 📁 Clean Repository Structure

```
csa-checklist-app/
├── public/                 # Static brand assets (Granules logo, vector icons)
│   └── granules_logo.png
├── scripts/                # Data ETL pipeline, audit extractors & launchers
│   ├── feed_real_csa_data.py
│   ├── extract_csa.py
│   ├── generate_multi_units.py
│   ├── start.bat
│   └── start-dev.bat
├── src/
│   ├── components/         # Modular React UI components
│   │   ├── dashboard/      # Executive Landing & Maturity Benchmark
│   │   │   ├── SummaryDashboard.jsx
│   │   │   └── CriteriaAndMaturity.jsx
│   │   ├── audit/          # Comprehensive Safety Audit & 19 Checklists
│   │   │   ├── ComprehensiveSafetyAudit.jsx
│   │   │   ├── ChecklistSheet.jsx
│   │   │   ├── CoverPage.jsx
│   │   │   ├── AuditTeam.jsx
│   │   │   └── SheetTabs.jsx
│   │   ├── analytics/      # 6-Unit Cross-Facility Analytics
│   │   │   └── InteractiveAnalytics.jsx
│   │   └── common/         # Layout & Error Handling
│   │       ├── Sidebar.jsx
│   │       └── ErrorBoundary.jsx
│   ├── data/               # Multi-unit JSON datasets
│   │   ├── multi_units_data.json
│   │   └── legacy_csa_data.json
│   ├── hooks/              # Custom React hooks
│   │   └── useTableResize.jsx
│   ├── utils/              # Utilities & Theme definitions
│   │   ├── excelExport.js
│   │   └── themes.js
│   ├── App.jsx             # Root application orchestrator
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global typography & Tailwind styling
├── index.html              # HTML shell
├── server.js               # Production SPA server
├── package.json            # Project dependencies & npm scripts
└── vite.config.js          # Vite configuration
```

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
# Start development server with HMR
npm run dev

# Or build for production and launch server
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Data Visualizations**: Chart.js 4 + React-Chartjs-2
- **Data Processing & Export**: SheetJS (xlsx) + OpenPyXL (Python ETL)
