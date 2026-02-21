import type { ResultRow } from '../../store/wizardStore';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function csvQuote(value: string): string {
  // Escape double-quotes by doubling them, then wrap in quotes
  return `"${value.replace(/"/g, '""')}"`;
}

export function useResultsExport(
  results: ResultRow[],
  fields: string[],
  batchName: string
) {
  const downloadCSV = () => {
    const headers = [
      'File',
      'Status',
      'Error',
      'Duration(s)',
      ...fields.flatMap((f) => [`${f}_ocr`, `${f}_edited`]),
    ];

    const rows = results.map((row) => [
      row.filename,
      row.status,
      row.error ?? '',
      row.duration.toFixed(3),
      ...fields.flatMap((f) => [
        row.data[f] ?? '',
        row.editedData[f] ?? '',
      ]),
    ]);

    const csvLines = [
      headers.map(csvQuote).join(','),
      ...rows.map((row) => row.map(csvQuote).join(',')),
    ];

    // UTF-8 BOM + CRLF line endings for Excel compatibility
    const csvContent = '\uFEFF' + csvLines.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `${batchName}_results.csv`);
  };

  const downloadJSON = () => {
    const payload = results.map((row) => ({
      filename: row.filename,
      status: row.status,
      error: row.error ?? null,
      duration: row.duration,
      fields: Object.fromEntries(
        fields.map((f) => [
          f,
          {
            ocr: row.data[f] ?? '',
            ...(row.editedData[f] !== undefined ? { edited: row.editedData[f] } : {}),
          },
        ])
      ),
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    triggerDownload(blob, `${batchName}_results.json`);
  };

  return { downloadCSV, downloadJSON };
}
