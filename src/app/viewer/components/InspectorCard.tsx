import { ui } from "../ui";

interface InspectorCardProps {
  inspectorText: string;
}

export function InspectorCard({ inspectorText }: InspectorCardProps) {
  return (
    <article className={ui.card}>
      <div className={ui.cardTitleRow}>
        <h2 className={ui.cardTitle}>Inspector</h2>
        <span className={ui.cardHint}>Full response from the last action</span>
      </div>
      <pre className={ui.inspector}>{inspectorText}</pre>
    </article>
  );
}
