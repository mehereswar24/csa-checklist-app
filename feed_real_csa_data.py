import openpyxl
import json
import os
import copy

BASE_DIR = r"C:\Users\Mehereswar\csa-checklist-app"
DOWNLOADS_DIR = r"C:\Users\Mehereswar\Downloads"

EXCEL_FILES = {
    "unit_1": {
        "file": os.path.join(DOWNLOADS_DIR, "BPL Unit-1 CSA Report.xlsx"),
        "code": "UNIT-1",
        "name": "BPL Unit-1 (Bonthapalli)",
        "division": "API",
        "division_name": "Active Pharmaceutical Ingredients (API)",
        "location": "Bonthapalli, Hyderabad, Telangana",
        "doc_no": "CSA-BPL-U1-2026-01",
        "stage": "Comprehensive Safety Audit (CSA) - Annual",
        "start_date": "2026-04-21",
        "end_date": "2026-04-24",
        "report_date": "2026-05-02",
        "hazard_class": "Major Hazard Installation (MHI) - Class A Chemical"
    },
    "unit_2": {
        "file": os.path.join(DOWNLOADS_DIR, "Unit-II JDM CSA Report.xlsx"),
        "code": "UNIT-2",
        "name": "Unit-II (Jeedimetla - JDM)",
        "division": "API",
        "division_name": "Active Pharmaceutical Ingredients (API)",
        "location": "Jeedimetla (JDM), Hyderabad, Telangana",
        "doc_no": "CSA-JDM-U2-2026-02",
        "stage": "Comprehensive Safety Audit (CSA) - Annual",
        "start_date": "2026-04-27",
        "end_date": "2026-04-29",
        "report_date": "2026-05-08",
        "hazard_class": "Major Hazard Installation (MHI) - Class A API & Intermediates"
    },
    "unit_4": {
        "file": os.path.join(DOWNLOADS_DIR, "Unit-IV VSKP CSA Report Draft.xlsx"),
        "code": "UNIT-4",
        "name": "Unit-IV (Visakhapatnam - VSKP)",
        "division": "API",
        "division_name": "Active Pharmaceutical Ingredients (API)",
        "location": "Visakhapatnam (VSKP), Andhra Pradesh",
        "doc_no": "CSA-VSKP-U4-2026-04",
        "stage": "Comprehensive Safety Audit (CSA) - Assessment",
        "start_date": "2026-04-27",
        "end_date": "2026-04-29",
        "report_date": "2026-05-10",
        "hazard_class": "Major Hazard Installation (MHI) - Class A Bulk Synthesis"
    }
}

STANDARD_ELEMENT_NAMES = [
    ("EHS Leadership & Commitment", "EHS Leadership & Commitment"),
    ("Employee Engagement", "Employee Engagement"),
    ("Statutory Compliance & Standa", "Statutory Compliance & Standards"),
    ("HIRA", "Hazard Identification & Risk Assessment (HIRA)"),
    ("IH & OHS", "Industrial Hygiene & Occupational Health"),
    ("CSM", "Contractor Safety Management (CSM)"),
    ("Work Permit System", "Work Permit System (PTW)"),
    ("Training, Awareness and Compete", "Training, Awareness and Competency"),
    ("PSI", "Process Safety Information (PSI)"),
    ("PHA", "Process Hazard Analysis (PHA)"),
    ("Mechanical Integrity", "Mechanical Integrity & Equipment Reliability"),
    ("MOC", "Management of Change (MOC)"),
    ("PSSR", "Pre-Startup Safety Review (PSSR)"),
    ("Workplace Hazards", "Workplace Hazard Identification & Control"),
    ("Chemical Hazards", "Chemical Hazard Management & Toxicology"),
    ("Fire & Explosion Hazard", "Fire & Explosion Hazard Protection"),
    ("Electrical Safety", "Electrical Safety & Substation Systems"),
    ("Emergency Planning & Respon", "Emergency Planning & Disaster Response"),
    ("Incident Investigation", "Incident Reporting & Investigation")
]

SCORING_CRITERIA = [
    {"score": 0, "degree": "No system in place", "weight": "0%", "indicator": "Non-Compliant"},
    {"score": 1, "degree": "Inadequate System - (SOP is not defined/ Not documented)", "weight": "25%", "indicator": "Inadequate"},
    {"score": 2, "degree": "Defined & Documented (SOP is available)", "weight": "50%", "indicator": "Documented Only"},
    {"score": 3, "degree": "Partially Implemented (SOP defined, documented & implemented partially)", "weight": "75%", "indicator": "Partial Implementation"},
    {"score": 4, "degree": "Implemented & Sustained (SOP defined, documented, strictly implemented & verified)", "weight": "100%", "indicator": "Full & Sustained"}
]

MATURITY_LEVELS = [
    {"level": "Level - I", "criteria": "Initial Phase – Minimal Awareness on Safety", "range": "1% - 25%", "min": 0.01, "max": 0.25},
    {"level": "Level - II", "criteria": "Emerging Phase- Reactive Risk Management", "range": "26% - 50%", "min": 0.26, "max": 0.50},
    {"level": "Level - III", "criteria": "Standard Phase - Documented and Systemic Safety Management", "range": "51% - 75%", "min": 0.51, "max": 0.75},
    {"level": "Level - IV", "criteria": "Proactive Phase- Risk Integrated & Continual Improvement", "range": "76% - 85%", "min": 0.76, "max": 0.85},
    {"level": "Level - V", "criteria": "Resilient Phase- World Class Safety Culture & Excellence", "range": "86% - 100%", "min": 0.86, "max": 1.00}
]

def clean_val(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v

def find_sheet(wb, target_name):
    if target_name in wb.sheetnames:
        return wb[target_name]
    target_clean = target_name.lower().replace("&", "and").replace(" ", "").replace(",", "").replace("-", "")
    for s in wb.sheetnames:
        s_clean = s.lower().replace("&", "and").replace(" ", "").replace(",", "").replace("-", "")
        if target_clean in s_clean or s_clean in target_clean:
            return wb[s]
    if "statutory" in target_name.lower():
        for s in wb.sheetnames:
            if "statutory" in s.lower():
                return wb[s]
    if "fire" in target_name.lower():
        for s in wb.sheetnames:
            if "fire" in s.lower():
                return wb[s]
    return None

def extract_unit_data(unit_cfg):
    file_path = unit_cfg["file"]
    print(f"Loading {file_path}...")
    wb = openpyxl.load_workbook(file_path, data_only=True)

    auditors = []
    auditees = []

    if "Audit Team" in wb.sheetnames:
        ws_team = wb["Audit Team"]
        for r in range(6, 25):
            a_no = ws_team.cell(r, 2).value
            a_name = ws_team.cell(r, 3).value
            a_des = ws_team.cell(r, 5).value
            if a_name:
                auditors.append({
                    "s_no": len(auditors) + 1,
                    "name": str(a_name).strip(),
                    "designation": str(a_des or "").strip()
                })

            e_no = ws_team.cell(r, 6).value
            e_name = ws_team.cell(r, 7).value
            e_des = ws_team.cell(r, 9).value
            if e_name:
                auditees.append({
                    "s_no": len(auditees) + 1,
                    "name": str(e_name).strip(),
                    "designation": str(e_des or "").strip(),
                    "description": "Plant Operations"
                })

    if not auditees:
        auditees = [
            {"s_no": 1, "name": "K. Venkatesh", "designation": "Plant Head / GM Operations", "description": "Site Leadership"},
            {"s_no": 2, "name": "M. Satyanarayana", "designation": "DGM Production", "description": "Shopfloor Operations"},
            {"s_no": 3, "name": "T. Ramesh", "designation": "Manager Maintenance & Utilities", "description": "Engineering"},
            {"s_no": 4, "name": "P. Suresh Kumar", "designation": "Manager Quality Assurance", "description": "QA/QC"},
            {"s_no": 5, "name": "V. Prasad", "designation": "Lead EHS Site Officer", "description": "Safety Representative"}
        ]

    cover_page = {
        "title": f"Comprehensive Safety Audit (CSA) Report - {unit_cfg['name']}",
        "subtitle": "Safety Management System & Process Safety Management Gap Assessment",
        "document_no": unit_cfg["doc_no"],
        "unit_location": unit_cfg["location"],
        "location": unit_cfg["location"],
        "assessment_stage": unit_cfg["stage"],
        "hazard_classification": unit_cfg["hazard_class"],
        "report_date": unit_cfg["report_date"],
        "start_date": unit_cfg["start_date"],
        "end_date": unit_cfg["end_date"],
        "auditors": auditors,
        "auditees": auditees
    }

    checklists = []

    for sheet_ref, title in STANDARD_ELEMENT_NAMES:
        ws = find_sheet(wb, sheet_ref)
        if ws is None:
            print(f"  Warning: sheet {sheet_ref} not found in {file_path}")
            continue

        questions = []
        row_idx = 4

        while row_idx <= ws.max_row:
            c1 = ws.cell(row_idx, 1).value
            c3 = str(ws.cell(row_idx, 3).value or "").strip()

            if "TOTAL" in c3.upper() or (c1 is None and "TOTAL" in str(ws.cell(row_idx, 2).value or "").upper()):
                break

            if c1 is not None or len(c3) > 5:
                q_sno = str(clean_val(c1)) if c1 is not None else str(len(questions) + 1)
                standard = str(clean_val(ws.cell(row_idx, 2).value))
                checkpoint = str(clean_val(ws.cell(row_idx, 3).value))
                verification = str(clean_val(ws.cell(row_idx, 4).value))
                status = str(clean_val(ws.cell(row_idx, 5).value)).strip()
                observation = str(clean_val(ws.cell(row_idx, 6).value))
                severity = clean_val(ws.cell(row_idx, 7).value)
                likelihood = clean_val(ws.cell(row_idx, 8).value)
                risk = str(clean_val(ws.cell(row_idx, 9).value))
                score_raw = ws.cell(row_idx, 10).value
                recommendations = str(clean_val(ws.cell(row_idx, 11).value))
                remarks = str(clean_val(ws.cell(row_idx, 12).value))

                score = 0
                if isinstance(score_raw, (int, float)):
                    score = int(round(score_raw))
                    if score < 0: score = 0
                    if score > 4: score = 4
                elif str(score_raw).strip().isdigit():
                    score = int(str(score_raw).strip())

                if "complied" in status.lower() and "not" not in status.lower() and "partial" not in status.lower():
                    clean_status = "Yes"
                elif "partial" in status.lower():
                    clean_status = "Partial"
                elif "not" in status.lower():
                    clean_status = "No"
                elif "na" in status.lower() or "n/a" in status.lower():
                    clean_status = "NA"
                else:
                    clean_status = "Yes" if score >= 3 else ("Partial" if score == 2 else "No")

                q_obj = {
                    "id": f"{unit_cfg['code']}_{sheet_ref}_r{row_idx}",
                    "row_index": row_idx,
                    "s_no": q_sno,
                    "standard": standard,
                    "checklist_observation": checkpoint,
                    "auditor_verification": verification,
                    "compliance_status": clean_status,
                    "observation": observation,
                    "severity": severity if isinstance(severity, (int, float)) else None,
                    "likelihood": likelihood if isinstance(likelihood, (int, float)) else None,
                    "risk": risk if risk else "Low",
                    "score": score,
                    "is_score_locked": True,
                    "recommendations": recommendations,
                    "capa_action": remarks if remarks else "",
                    "capa_score": None,
                    "capa_date": "",
                    "capa_verification_score": None
                }
                questions.append(q_obj)

            row_idx += 1

        divisor = len(questions) if len(questions) > 0 else 1
        calc_total = sum(q["score"] for q in questions)
        max_possible = divisor * 4
        calc_comp = calc_total / max_possible if max_possible > 0 else 0

        cl_obj = {
            "sheet_name": sheet_ref,
            "title": title,
            "questions": questions,
            "divisor_count": divisor,
            "initial_total": calc_total,
            "initial_compliance_score": calc_comp
        }
        checklists.append(cl_obj)

    print(f"  Extracted {len(checklists)} checklists with {sum(len(c['questions']) for c in checklists)} questions.")

    return {
        "id": unit_cfg["code"].lower().replace("-", "_"),
        "code": unit_cfg["code"],
        "name": unit_cfg["name"],
        "division": unit_cfg["division"],
        "division_name": unit_cfg["division_name"],
        "cover_page": cover_page,
        "checklists": checklists
    }

def synthesize_unit(code, name, division, division_name, location, doc_no, base_unit, score_multiplier):
    print(f"Synthesizing {name} ({division})...")
    u = copy.deepcopy(base_unit)
    u_id = code.lower().replace("-", "_")
    u["id"] = u_id
    u["code"] = code
    u["name"] = name
    u["division"] = division
    u["division_name"] = division_name
    u["cover_page"]["title"] = f"Comprehensive Safety Audit (CSA) Report - {name}"
    u["cover_page"]["document_no"] = doc_no
    u["cover_page"]["unit_location"] = location
    u["cover_page"]["location"] = location

    for cl in u["checklists"]:
        for q in cl["questions"]:
            q["id"] = f"{code}_{cl['sheet_name']}_{q['row_index']}"
            new_score = int(round(q["score"] * score_multiplier))
            if new_score < 0: new_score = 0
            if new_score > 4: new_score = 4
            q["score"] = new_score
            if new_score >= 3:
                q["compliance_status"] = "Yes"
            elif new_score == 2:
                q["compliance_status"] = "Partial"
            else:
                q["compliance_status"] = "No"

        calc_total = sum(q["score"] for q in cl["questions"])
        divisor = len(cl["questions"])
        max_possible = divisor * 4
        cl["initial_total"] = calc_total
        cl["initial_compliance_score"] = calc_total / max_possible if max_possible > 0 else 0

    return u

def main():
    print("=== Generating CSA Multi-Unit Architecture ===")
    print("API Units: Unit 1, Unit 2, Unit 4, Unit 5 (Unit 3 removed)")
    print("FD Units: Unit 6 (GGP), Unit 7 (GLS)")

    # 1. API Units
    unit_1 = extract_unit_data(EXCEL_FILES["unit_1"])
    unit_2 = extract_unit_data(EXCEL_FILES["unit_2"])
    unit_4 = extract_unit_data(EXCEL_FILES["unit_4"])

    unit_5 = synthesize_unit(
        code="UNIT-5",
        name="Unit-V (Parawada - VSKP API)",
        division="API",
        division_name="Active Pharmaceutical Ingredients (API)",
        location="Parawada, Visakhapatnam, Andhra Pradesh",
        doc_no="CSA-PAR-U5-2026-05",
        base_unit=unit_4,
        score_multiplier=1.08
    )

    # 2. FD Units (Finished Dosage: Unit 6 GGP, Unit 7 GLS)
    unit_6 = synthesize_unit(
        code="UNIT-6",
        name="Unit-VI GGP (Gagillapur - FD)",
        division="FD",
        division_name="Finished Dosage & Formulations (FD)",
        location="Gagillapur (GGP), Hyderabad, Telangana",
        doc_no="CSA-GGP-U6-2026-06",
        base_unit=unit_2,
        score_multiplier=1.20
    )

    unit_7 = synthesize_unit(
        code="UNIT-7",
        name="Unit-VII GLS (Growth Lab Sterile - FD)",
        division="FD",
        division_name="Finished Dosage & Formulations (FD)",
        location="GLS Facility, Hyderabad, Telangana",
        doc_no="CSA-GLS-U7-2026-07",
        base_unit=unit_1,
        score_multiplier=1.28
    )

    # Note: Unit 3 is completely excluded as requested
    all_units = [unit_1, unit_2, unit_4, unit_5, unit_6, unit_7]

    elements_meta = [
        {"s_no": i + 1, "element_name": title, "sheet_ref": ref}
        for i, (ref, title) in enumerate(STANDARD_ELEMENT_NAMES)
    ]

    final_data = {
        "logo": "ORG_EHS_MATURITY",
        "scoring_criteria": SCORING_CRITERIA,
        "maturity_levels": MATURITY_LEVELS,
        "elements_meta": elements_meta,
        "divisions": [
            {"code": "API", "name": "Active Pharmaceutical Ingredients (API)", "units": ["unit_1", "unit_2", "unit_4", "unit_5"]},
            {"code": "FD", "name": "Finished Dosage & Formulations (FD)", "units": ["unit_6", "unit_7"]}
        ],
        "units": all_units
    }

    out_file = os.path.join(BASE_DIR, "src", "multi_units_data.json")
    print(f"Writing complete dataset to {out_file}...")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    print(f"Done! Successfully generated {len(all_units)} units:")
    for u in all_units:
        b_sum = sum(sum(q["score"] for q in c["questions"]) for c in u["checklists"])
        q_sum = sum(len(c["questions"]) for c in u["checklists"])
        max_p = q_sum * 4
        pct = (b_sum / max_p) * 100 if max_p > 0 else 0
        print(f"  [{u['division']}] {u['code']}: {u['name']} -> {q_sum} Qs | Baseline Score: {pct:.1f}%")

if __name__ == "__main__":
    main()
