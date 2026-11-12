import * as XLSX from 'xlsx';

export function exportToExcel(data) {
  const wb = XLSX.utils.book_new();

  // 1. Cover Page
  const cpRows = [
    ['', '', '', data.cover_page.title || 'Comprehensive Safety Audit'],
    [],
    [],
    [],
    [],
    ['', 'Document No:', data.cover_page.document_no || '', '', '', '', '', 'Report prepared Date: ', '', data.cover_page.report_date || ''],
    ['', 'Unit Location :', data.cover_page.unit_location || '', '', '', '', '', 'Assessment Start date: ', data.cover_page.start_date || '', 'Assessment End Date : ', data.cover_page.end_date || ''],
    [],
    ['', '#', 'Auditor Name', '', 'Designation', '#', 'Auditee Name', '', 'Designation', 'Description (if any)']
  ];

  const maxRows = Math.max(data.cover_page.auditors.length, data.cover_page.auditees.length);
  for (let i = 0; i < maxRows; i++) {
    const auditor = data.cover_page.auditors[i] || {};
    const auditee = data.cover_page.auditees[i] || {};
    cpRows.push([
      '',
      auditor.s_no || (i < data.cover_page.auditors.length ? i + 1 : ''),
      auditor.name || '',
      '',
      auditor.designation || '',
      auditee.s_no || (i < data.cover_page.auditees.length ? i + 1 : ''),
      auditee.name || '',
      '',
      auditee.designation || '',
      auditee.description || ''
    ]);
  }

  const cpSheet = XLSX.utils.aoa_to_sheet(cpRows);
  XLSX.utils.book_append_sheet(wb, cpSheet, 'Cover Page');

  // 2. Audit Team
  const atRows = [
    ['', '', '', data.audit_team.title || 'Comprehensive Safety Audit'],
    [],
    ['', 'Unit', data.audit_team.unit || '', '', '', '', '', '', 'Date', data.audit_team.date || ''],
    ['', 'Location', data.audit_team.location || ''],
    ['', 'S.No', 'Auditor Name', '', 'Designation', 'S.No', 'Auditee Name', '', 'Designation', 'Signature '],
  ];

  const maxAtRows = Math.max(data.audit_team.auditors.length, data.audit_team.auditees.length);
  for (let i = 0; i < maxAtRows; i++) {
    const auditor = data.audit_team.auditors[i] || {};
    const auditee = data.audit_team.auditees[i] || {};
    atRows.push([
      '',
      auditor.s_no || (i < data.audit_team.auditors.length ? i + 1 : ''),
      auditor.name || '',
      '',
      auditor.designation || '',
      auditee.s_no || (i < data.audit_team.auditees.length ? i + 1 : ''),
      auditee.name || '',
      '',
      auditee.designation || '',
      auditee.signature || ''
    ]);
  }

  const atSheet = XLSX.utils.aoa_to_sheet(atRows);
  XLSX.utils.book_append_sheet(wb, atSheet, 'Audit Team');

  // 3. Summary
  const smRows = [
    [data.summary.title || 'Safety Management System & Process Safety Management System - Gap Assessment'],
    [],
    [],
    ['Sl No', ' Element', 'Element Score'],
  ];

  let sumRowIdx = 5;
  data.summary.elements.forEach((elem, idx) => {
    // Dynamic score from checklists if present
    const cl = data.checklists.find(c => c.sheet_name === elem.sheet_ref);
    let score = elem.score;
    if (cl && cl.computedScore !== undefined) {
      score = cl.computedScore;
    }
    smRows.push([idx + 1, elem.element_name, score]);
    sumRowIdx++;
  });

  const avgFormula = `AVERAGE(C5:C${sumRowIdx - 1})`;
  const overallAvg = data.computedOverallScore !== undefined ? data.computedOverallScore : data.summary.overall_score;
  smRows.push(['Overall benchmarking score:', '', overallAvg]);
  smRows.push([]);
  smRows.push([]);
  smRows.push(['', 'Degree of Compliance - Scoring criteria for individual checkpoints', 'Score']);
  data.summary.scoring_criteria.forEach(sc => {
    smRows.push(['', sc.degree, sc.score]);
  });
  smRows.push([]);
  smRows.push(['Maturity Level', 'Maturity Mapping Criteria', 'Overall score']);
  data.summary.maturity_levels.forEach(ml => {
    smRows.push([ml.level, ml.criteria, ml.range]);
  });

  const smSheet = XLSX.utils.aoa_to_sheet(smRows);
  XLSX.utils.book_append_sheet(wb, smSheet, 'Summary');

  // 4. Checklist Sheets
  data.checklists.forEach(cl => {
    const rows = [
      [cl.title || cl.sheet_name],
      [],
      ['S.No', 'CHECKLIST OBSERVATION', 'Auditor Verification', 'COMPLIANCE STATUS', 'OBSERVATION', 'SCORE', 'RECOMMENDATIONS', 'REMARKS']
    ];

    cl.questions.forEach(q => {
      rows.push([
        q.s_no,
        q.checklist_observation,
        q.auditor_verification,
        q.compliance_status || '',
        q.observation || '',
        q.score !== null && q.score !== undefined ? q.score : '',
        q.recommendations || '',
        q.remarks || ''
      ]);
    });

    const totalScore = cl.computedTotal !== undefined ? cl.computedTotal : cl.initial_total;
    const compScore = cl.computedScore !== undefined ? cl.computedScore : cl.initial_compliance_score;

    rows.push(['', 'TOTAL', '', '', '', totalScore, '', '']);
    rows.push(['', 'ELEMENT COMPLIANCE SCORE', '', '', '', compScore, cl.title || cl.sheet_name, '']);

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, sheet, cl.sheet_name.substring(0, 31));
  });

  // Export
  XLSX.writeFile(wb, `CSA_Checklist_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
