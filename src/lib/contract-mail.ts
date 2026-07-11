export function opzegAlertOnderwerp(partij: string, type: 90 | 60 | 30) {
  return `Opzegtermijn ${partij} nadert (nog ${type} dagen)`;
}

export function opzegAlertHtml(params: {
  partij: string;
  type: 90 | 60 | 30;
  opzegdeadline: string;
  einddatum: string;
  contractType: string;
}) {
  const deadlineFormatted = new Date(params.opzegdeadline).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const einddatumFormatted = new Date(params.einddatum).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111827;">Opzegtermijn nadert</h2>
      <p>Over <strong>${params.type} dagen</strong> is het de laatste kans om het volgende contract op te zeggen:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Contractpartij</td>
          <td style="padding: 6px 0; font-weight: 600;">${params.partij}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Contracttype</td>
          <td style="padding: 6px 0;">${params.contractType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Opzegdeadline</td>
          <td style="padding: 6px 0; font-weight: 600;">${deadlineFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Einddatum contract</td>
          <td style="padding: 6px 0;">${einddatumFormatted}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">
        Deze e-mail is automatisch verstuurd door Termino.
      </p>
    </div>
  `;
}
