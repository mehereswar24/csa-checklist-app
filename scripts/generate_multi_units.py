import json

with open(r'C:\Users\Mehereswar\csa-checklist-app\src\csa_data.json', 'r', encoding='utf-8') as f:
    base_data = json.load(f)

units_info = [
    {'id': 'unit_1', 'name': 'Unit 1 - API & Bulk Drugs', 'code': 'UNIT-01', 'location': 'Hyderabad Plant 1', 'score_adj': 0.0},
    {'id': 'unit_2', 'name': 'Unit 2 - Formulations Facility', 'code': 'UNIT-02', 'location': 'Vizag SEZ Block', 'score_adj': 0.05},
    {'id': 'unit_3', 'name': 'Unit 3 - Chemical Synthesis', 'code': 'UNIT-03', 'location': 'Dahej Chemical Zone', 'score_adj': -0.08},
    {'id': 'unit_4', 'name': 'Unit 4 - R&D & Pilot Center', 'code': 'UNIT-04', 'location': 'Bangalore Innovation Park', 'score_adj': 0.12},
    {'id': 'unit_5', 'name': 'Unit 5 - Central Logistics Hub', 'code': 'UNIT-05', 'location': 'Nagpur Logistics Hub', 'score_adj': -0.04},
    {'id': 'unit_6', 'name': 'Unit 6 - Environmental & Utilities', 'code': 'UNIT-06', 'location': 'Pithampur Utilities Block', 'score_adj': 0.02}
]

units = []
for u in units_info:
    # Build unit cover page
    cp = {
        'document_no': f"CSA/{u['code']}/2026",
        'report_date': '2026-10-15',
        'unit_location': u['location'],
        'start_date': '2026-10-01',
        'end_date': '2026-10-05',
        'audit_stage': 'Comprehensive Periodic Audit',
        'auditors': [
            {'s_no': 1, 'name': 'Dr. K. S. Sharma', 'designation': 'Lead Safety Auditor'},
            {'s_no': 2, 'name': 'Anil Mehta', 'designation': 'Process Safety Specialist'},
            {'s_no': 3, 'name': 'P. V. Rao', 'designation': 'Electrical & Mechanical Auditor'}
        ],
        'auditees': [
            {'s_no': 1, 'name': 'R. Rajesh', 'designation': 'Plant Operations Head', 'description': 'Overall Operations'},
            {'s_no': 2, 'name': 'Suresh Kumar', 'designation': 'EHS Manager', 'description': 'Safety & Compliance'},
            {'s_no': 3, 'name': 'M. Venkat', 'designation': 'Maintenance Lead', 'description': 'Mechanical Integrity'},
            {'s_no': 4, 'name': 'Deepak Verma', 'designation': 'Production Manager', 'description': 'Production Units'},
            {'s_no': 5, 'name': 'K. Raman', 'designation': 'Quality & Compliance', 'description': 'QA/QC'}
        ]
    }

    # Build checklists for this unit
    checklists = []
    for cl in base_data['checklists']:
        questions = []
        for q in cl['questions']:
            orig_s = q['score']
            if orig_s is None:
                orig_s = 2
            
            # Unit variation
            if u['score_adj'] != 0.0:
                h = abs(hash(f"{u['id']}_{q['id']}")) % 10
                if h < 2 and u['score_adj'] > 0 and orig_s < 4:
                    orig_s = min(4, orig_s + 1)
                elif h < 2 and u['score_adj'] < 0 and orig_s > 0:
                    orig_s = max(0, orig_s - 1)

            # Sample CAPA for lower scoring items
            has_capa = orig_s <= 2 and (abs(hash(f"capa_{u['id']}_{q['id']}")) % 3 == 0)
            capa_action = 'SOP updated, training scheduled and interlocks inspected.' if has_capa else ''
            capa_score = 3 if has_capa else None
            capa_date = '2026-11-20' if has_capa else ''
            capa_ver_score = 3 if has_capa else None

            questions.append({
                'id': f"{u['id']}_{q['id']}",
                'row_index': q['row_index'],
                's_no': q['s_no'],
                'checklist_observation': q['checklist_observation'],
                'auditor_verification': q['auditor_verification'],
                'compliance_status': q['compliance_status'] or ('Partial' if orig_s < 3 else 'Yes'),
                'observation': q['observation'] or ('Deficiency identified during audit' if orig_s <= 1 else ''),
                'score': orig_s,
                'is_score_locked': True,
                'recommendations': q['recommendations'] or ('Implement structured corrective action' if orig_s <= 2 else ''),
                'capa_action': capa_action,
                'capa_score': capa_score,
                'capa_date': capa_date,
                'capa_verification_score': capa_ver_score
            })

        checklists.append({
            'sheet_name': cl['sheet_name'],
            'title': cl['title'],
            'divisor_count': cl['divisor_count'],
            'score_formula': cl['score_formula'],
            'questions': questions
        })

    units.append({
        'id': u['id'],
        'name': u['name'],
        'code': u['code'],
        'location': u['location'],
        'cover_page': cp,
        'checklists': checklists
    })

output_data = {
    'logo': base_data.get('logo', ''),
    'scoring_criteria': base_data['summary']['scoring_criteria'],
    'maturity_levels': base_data['summary']['maturity_levels'],
    'elements_meta': [{'sl_no': e['sl_no'], 'element_name': e['element_name'], 'sheet_ref': e['sheet_ref']} for e in base_data['summary']['elements']],
    'units': units
}

with open(r'C:\Users\Mehereswar\csa-checklist-app\src\multi_units_data.json', 'w', encoding='utf-8') as out_f:
    json.dump(output_data, out_f, indent=2, ensure_ascii=False)

print(f"Generated {len(units)} units with complete data.")
