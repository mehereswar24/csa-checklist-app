import openpyxl
import json
import os
import base64

EXCEL_PATH = r"C:\Users\Mehereswar\Downloads\CSA Checklist.xlsx"
OUTPUT_JSON = r"C:\Users\Mehereswar\csa-checklist-app\csa_data.json"
MEDIA_DIR = r"C:\Users\Mehereswar\Downloads\csa_extracted\xl\media"

wb_formula = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
wb_value = openpyxl.load_workbook(EXCEL_PATH, data_only=True)

# 1. Logo
logo_b64 = ""
logo_path = os.path.join(MEDIA_DIR, "image1.png")
if os.path.exists(logo_path):
    with open(logo_path, "rb") as f:
        logo_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")

data = {
    "logo": logo_b64,
    "sheet_names": wb_value.sheetnames,
    "cover_page": {},
    "audit_team": {},
    "summary": {},
    "checklists": []
}

# 2. Cover Page
cp_val = wb_value["Cover Page"]
auditors_cp = []
for r in range(10, 15):
    auditors_cp.append({
        "s_no": cp_val.cell(r, 2).value or (r - 9),
        "name": cp_val.cell(r, 3).value or "",
        "designation": cp_val.cell(r, 5).value or ""
    })

auditees_cp = []
for r in range(10, 47):
    auditees_cp.append({
        "s_no": cp_val.cell(r, 6).value or (r - 9),
        "name": cp_val.cell(r, 7).value or "",
        "designation": cp_val.cell(r, 9).value or "",
        "description": cp_val.cell(r, 10).value or ""
    })

data["cover_page"] = {
    "title": cp_val.cell(2, 4).value or "Comprehensive Safety Audit",
    "document_no": cp_val.cell(6, 4).value or "",
    "report_date": str(cp_val.cell(6, 10).value or "") if cp_val.cell(6, 10).value else "",
    "unit_location": cp_val.cell(7, 4).value or "",
    "start_date": str(cp_val.cell(7, 9).value or "") if cp_val.cell(7, 9).value else "",
    "end_date": str(cp_val.cell(7, 11).value or "") if cp_val.cell(7, 11).value else "",
    "auditors": auditors_cp,
    "auditees": auditees_cp
}

# 3. Audit Team
at_val = wb_value["Audit Team"]
auditors_at = []
for r in range(6, 16):
    auditors_at.append({
        "s_no": at_val.cell(r, 2).value or (r - 5),
        "name": at_val.cell(r, 3).value or "",
        "designation": at_val.cell(r, 5).value or ""
    })

auditees_at = []
for r in range(6, 16):
    auditees_at.append({
        "s_no": at_val.cell(r, 6).value or (r - 5),
        "name": at_val.cell(r, 7).value or "",
        "designation": at_val.cell(r, 9).value or "",
        "signature": at_val.cell(r, 10).value or ""
    })

data["audit_team"] = {
    "title": at_val.cell(1, 4).value or "Comprehensive Safety Audit",
    "unit": at_val.cell(3, 3).value or "",
    "date": str(at_val.cell(3, 10).value or "") if at_val.cell(3, 10).value else "",
    "location": at_val.cell(4, 3).value or "",
    "auditors": auditors_at,
    "auditees": auditees_at
}

# 4. Summary
sm_val = wb_value["Summary"]
sm_form = wb_formula["Summary"]
elements = []
for r in range(5, 24):
    f = sm_form.cell(r, 3).value or ""
    v = sm_val.cell(r, 3).value
    sheet_ref = ""
    if "!" in str(f):
        sheet_ref = str(f).split("!")[0].replace("=", "").replace("'", "")
    elements.append({
        "sl_no": sm_val.cell(r, 1).value,
        "element_name": str(sm_val.cell(r, 2).value or "").strip(),
        "formula": str(f),
        "sheet_ref": sheet_ref,
        "initial_score": float(v) if v is not None else 0.0
    })

scoring_criteria = [
    {"score": 0, "degree": "No system in place"},
    {"score": 1, "degree": "Inadequate System - (SOP is not defined/ Not documented)"},
    {"score": 2, "degree": "System available - (but not inline with document)"},
    {"score": 3, "degree": "System in existence - Documented system in place & followed - Procedures and Records available"},
    {"score": 4, "degree": "Excellent - Documented system benchmarked against applicable standards & best international practices"}
]

maturity_levels = [
    {"level": "Level - I", "criteria": "Initial Phase – Minimal Awareness on Safety", "range": "1% - 25%", "min": 0.01, "max": 0.25},
    {"level": "Level - II", "criteria": "Emerging Phase- Reactive Risk Management", "range": "26% - 50%", "min": 0.26, "max": 0.50},
    {"level": "Level - III", "criteria": "Developing Phase – Proactive Risk Management", "range": "51% - 75%", "min": 0.51, "max": 0.75},
    {"level": "Level - IV", "criteria": "Maturing Phase - System Driven Safety performance", "range": "76% - 90%", "min": 0.76, "max": 0.90},
    {"level": "Level - V", "criteria": "Leading Phase – Safety Integrated with Leadership & Strategy", "range": "91% - 100%", "min": 0.91, "max": 1.00}
]

data["summary"] = {
    "title": sm_val.cell(1, 1).value or "Safety Management System & Process Safety Management System - Gap Assessment",
    "elements": elements,
    "scoring_criteria": scoring_criteria,
    "maturity_levels": maturity_levels,
    "overall_score": float(sm_val.cell(24, 3).value or 0.0)
}

# 5. Checklist Sheets
checklist_names = [s for s in wb_value.sheetnames if s not in ["Cover Page", "Audit Team", "Summary"]]

for sname in checklist_names:
    ws_f = wb_formula[sname]
    ws_v = wb_value[sname]

    # Sheet title
    title = ws_v.cell(1, 1).value or ws_v.cell(2, 1).value or ws_v.cell(1, 2).value or sname

    # Locate header row
    header_r = None
    for r in range(1, 10):
        val2 = ws_v.cell(r, 2).value
        if val2 and "CHECKLIST" in str(val2).upper():
            header_r = r
            break
    if not header_r:
        header_r = 3

    # Locate score row
    score_r = None
    total_r = None
    for r in range(header_r + 1, ws_v.max_row + 1):
        c2 = str(ws_v.cell(r, 2).value or "").upper()
        c1 = str(ws_v.cell(r, 1).value or "").upper()
        if "TOTAL" in c1 or "TOTAL" in c2:
            total_r = r
        if "COMPLIANCE SCORE" in c2 or "COMPLIANCE SCORE" in c1:
            score_r = r
            break

    # If score_r not found by text, search for formula containing 'F' or '/'
    if not score_r:
        for r in range(ws_v.max_row, header_r, -1):
            fval = str(ws_f.cell(r, 6).value or "")
            if "/" in fval:
                score_r = r
                if not total_r:
                    total_r = r - 1
                break

    # Extract questions
    questions = []
    end_q_row = (total_r if total_r else score_r) or (ws_v.max_row + 1)
    
    for r in range(header_r + 1, end_q_row):
        s_no = ws_v.cell(r, 1).value
        obs = ws_v.cell(r, 2).value
        ver = ws_v.cell(r, 3).value
        comp_status = ws_v.cell(r, 4).value
        auditor_obs = ws_v.cell(r, 5).value
        score = ws_v.cell(r, 6).value
        recommendations = ws_v.cell(r, 7).value
        remarks = ws_v.cell(r, 8).value

        # Skip rows that are empty or total lines
        if not obs and not ver and score is None:
            continue
        if obs and ("TOTAL" in str(obs).upper() or "ELEMENT COMPLIANCE" in str(obs).upper()):
            continue

        # Score parsing
        parsed_score = None
        if score is not None:
            try:
                parsed_score = int(score)
            except:
                try:
                    parsed_score = float(score)
                except:
                    parsed_score = None

        questions.append({
            "id": f"{sname}_r{r}",
            "row_index": r,
            "s_no": str(s_no).strip() if s_no is not None else "",
            "checklist_observation": str(obs).strip() if obs else "",
            "auditor_verification": str(ver).strip() if ver else "",
            "compliance_status": str(comp_status).strip() if comp_status is not None else "",
            "observation": str(auditor_obs).strip() if auditor_obs is not None else "",
            "score": parsed_score,
            "recommendations": str(recommendations).strip() if recommendations is not None else "",
            "remarks": str(remarks).strip() if remarks is not None else ""
        })

    # Total and score formulas
    total_val = ws_v.cell(total_r, 6).value if total_r else None
    score_val = ws_v.cell(score_r, 6).value if score_r else None
    score_formula = ws_f.cell(score_r, 6).value if score_r else ""

    # Parse divisor count
    # E.g., formula is =F36/(A35*4)
    divisor_count = len(questions)
    # Check if formula specifies cell
    if score_formula and "/" in str(score_formula):
        import re
        match = re.search(r"\(A(\d+)\*4\)", str(score_formula))
        if match:
            ref_row = int(match.group(1))
            val_a = ws_v.cell(ref_row, 1).value
            try:
                divisor_count = int(val_a)
            except:
                pass

    checklist_item = {
        "sheet_name": sname,
        "title": str(title).strip(),
        "header_row": header_r,
        "total_row": total_r,
        "score_row": score_r,
        "divisor_count": divisor_count,
        "score_formula": str(score_formula),
        "initial_total": float(total_val) if total_val is not None else 0.0,
        "initial_compliance_score": float(score_val) if score_val is not None else 0.0,
        "questions": questions
    }
    data["checklists"].append(checklist_item)

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully extracted {len(data['checklists'])} checklists and saved to {OUTPUT_JSON}")
