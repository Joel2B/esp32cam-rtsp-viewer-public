import styles from "@/app/page.module.css";

import type { CatalogItem, OpenDirect } from "../types";

interface EndpointCatalogCardProps {
  apiCatalog: CatalogItem[];
  hasValidBase: boolean;
  runCatalogItem: (item: CatalogItem) => Promise<void>;
  openDirect: OpenDirect;
}

export function EndpointCatalogCard({
  apiCatalog,
  hasValidBase,
  runCatalogItem,
  openDirect,
}: EndpointCatalogCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTitleRow}>
        <h2 className={styles.cardTitle}>Endpoint Catalog</h2>
        <p className={styles.cardHint}>Includes all firmware endpoints and options.</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Options</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiCatalog.map((item) => (
              <tr key={item.id}>
                <td className={styles.code}>{item.path}</td>
                <td className={styles.code}>{item.options}</td>
                <td>{item.description}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => {
                        void runCatalogItem(item);
                      }}
                      disabled={!hasValidBase}
                    >
                      Run
                    </button>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => openDirect(item.path, item.query ?? {})}
                      disabled={!hasValidBase}
                    >
                      Open
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
