import styles from "@/app/page.module.css";

interface InspectorCardProps {
  inspectorText: string;
}

export function InspectorCard({ inspectorText }: InspectorCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTitleRow}>
        <h2 className={styles.cardTitle}>Inspector</h2>
        <span className={styles.cardHint}>Full response from the last action</span>
      </div>
      <pre className={styles.inspector}>{inspectorText}</pre>
    </article>
  );
}
