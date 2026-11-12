import * as XLSX from 'xlsx';

export function exportToExcel(data, selectedUnitId = 'unit_1') {
  const wb = XLSX.utils.book_new();

  const units = data.units || [];
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0] || {};
  const cp = currentUnit.cover_page || {};

  // 1. Multi-Unit Benchmark Summary Sheet
  const benchmarkRows = [
    ['Org EHS Maturity - Multi-Unit Cross Benchmark Report'],
    [`Generated Date: ${new Date().toLocaleDateString()}`],
    [],
    ['Unit Code', 'Unit Facility Name', 'Location', 'Baseline Score %', 'Post-CAPA Score %', 'CAPA Delta Gain', 'Maturity Level']
  ];

  units.forEach((u) => {
    let bTotal = 0;
    let pTotal = 0;
    let maxTotal = 0;

    u.checklists.forEach((cl) => {
      const div = cl.divisor_count || cl.questions.length || 1;
      maxTotal += div * 4;
      cl.questions.forEach((q) => {
        const b = typeof q.score === 'number' ? q.score : 0;
        bTotal += b;
        const add =
          q.capa_verification_score !== null && q.capa_verification_score !== undefined
            ? Number(q.capa_verification_score)
            : q.capa_score !== null && q.capa_score !== undefined
            ? Number(q.capa_score)
            : 0;
        pTotal += Math.min(4, b + add);
      });
    });

    const bPct = maxTotal > 0 ? (bTotal / maxTotal) * 100 : 0;
    const pPct = maxTotal > 0 ? (pTotal / maxTotal) * 100 : 0;
    const dPct = pPct - bPct;

    const ml = (data.maturity_levels || []).find((m) => pPct / 100 >= m.min && pPct / 100 <= m.max) || {
      level: 'Level - I'
    };

    benchmarkRows.push([
      u.code,
      u.name,
      u.cover_page?.location || '',
      `${bPct.toFixed(1)}%`,
      `${pPct.toFixed(1)}%`,
      `+${dPct.toFixed(1)}%`,
      ml.level
    ]);
  });

  const bmSheet = XLSX.utils.aoa_to_sheet(benchmarkRows);
  XLSX.utils.book_append_sheet(wb, bmSheet, 'Org Units Benchmark');

  // 2. Comprehensive Safety Audit (Cover Page & Team) for Active Unit
  const cpRows = [
    ['', '', '', cp.title || `Comprehensive Safety Audit - ${currentUnit.name}`],
    [],
    ['', 'Assessment Stage:', cp.assessment_stage || '', '', '', '', '', 'Report Date:', cp.report_date || ''],
    ['', 'Document No:', cp.document_no || '', '', '', '', '', 'Hazard Class:', cp.hazard_classification || ''],
    ['', 'Unit Location:', cp.location || '', '', '', '', '', 'Start Date:', cp.start_date || '', 'End Date:', cp.end_date || ''],
    [],
    ['', '#', 'Auditor Name', '', 'Designation', '#', 'Auditee Name', '', 'Designation', 'Role / Department']
  ];

  const auditors = cp.auditors || [];
  const auditees = cp.auditees || [];
  const maxTeamRows = Math.max(auditors.length, auditees.length);

  for (let i = 0; i < maxTeamRows; i++) {
    const auditor = auditors[i] || {};
    const auditee = auditees[i] || {};
    cpRows.push([
      '',
      auditor.s_no || (i < auditors.length ? i + 1 : ''),
      auditor.name || '',
      '',
      auditor.designation || '',
      auditee.s_no || (i < auditees.length ? i + 1 : ''),
      auditee.name || '',
      '',
      auditee.designation || '',
      auditee.description || ''
    ]);
  }

  const cpSheet = XLSX.utils.aoa_to_sheet(cpRows);
  XLSX.utils.book_append_sheet(wb, cpSheet, 'Assessment & Team');

  // 3. Element Checklists for Active Unit
  (currentUnit.checklists || []).forEach((cl) => {
    const rows = [
      [cl.title || cl.sheet_name],
      [`Unit: ${currentUnit.name} (${currentUnit.code})`],
      [],
      [
        'S.No',
        'CHECKLIST OBSERVATION',
        'Auditor Verification Guidelines',
        'COMPLIANCE STATUS',
        'OBSERVATION',
        'BASELINE SCORE (LOCKED)',
        'RECOMMENDATIONS',
        'CAPA ACTION',
        'CAPA SCORE',
        'CAPA DUE DATE',
        'CAPA VERIFICATION',
        'EFFECTIVE SCORE'
      ]
    ];

    let bTotal = 0;
    let pTotal = 0;

    cl.questions.forEach((q) => {
      const bScore = typeof q.score === 'number' ? q.score : 0;
      const capaAdd =
        q.capa_verification_score !== null && q.capa_verification_score !== undefined
          ? Number(q.capa_verification_score)
          : q.capa_score !== null && q.capa_score !== undefined
          ? Number(q.capa_score)
          : 0;
      const effective = Math.min(4, bScore + capaAdd);

      bTotal += bScore;
      pTotal += effective;

      rows.push([
        q.s_no,
        q.checklist_observation,
        q.auditor_verification,
        q.compliance_status || '',
        q.observation || '',
        bScore,
        q.recommendations || '',
        q.capa_action || '',
        q.capa_score !== null && q.capa_score !== undefined ? q.capa_score : '',
        q.capa_date || '',
        q.capa_verification_score !== null && q.capa_verification_score !== undefined ? q.capa_verification_score : '',
        effective
      ]);
    });

    const divisor = cl.divisor_count || cl.questions.length || 1;
    const maxP = divisor * 4;

    rows.push(['', 'TOTAL BASELINE SCORE', '', '', '', bTotal, '', '', '', '', '', '']);
    rows.push(['', 'TOTAL POST-CAPA SCORE', '', '', '', '', '', '', '', '', '', pTotal]);
    rows.push([
      '',
      'BASELINE COMPLIANCE %',
      `${((bTotal / maxP) * 100).toFixed(1)}%`,
      '',
      '',
      'POST-CAPA COMPLIANCE %',
      `${((pTotal / maxP) * 100).toFixed(1)}%`
    ]);

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, sheet, cl.sheet_name.substring(0, 31));
  });

  // Export File
  XLSX.writeFile(wb, `Org_EHS_Maturity_${currentUnit.code || 'Report'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
