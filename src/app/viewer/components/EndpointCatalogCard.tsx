import type { CatalogItem, OpenDirect } from "../types";
import { ui } from "../ui";

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
    <article className={ui.card}>
      <div className={ui.cardTitleRow}>
        <h2 className={ui.cardTitle}>Endpoint Catalog</h2>
        <p className={ui.cardHint}>Includes all firmware endpoints and options.</p>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th className={ui.th}>Endpoint</th>
              <th className={ui.th}>Options</th>
              <th className={ui.th}>Description</th>
              <th className={ui.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiCatalog.map((item) => (
              <tr key={item.id}>
                <td className={`${ui.td} ${ui.code}`}>{item.path}</td>
                <td className={`${ui.td} ${ui.code}`}>{item.options}</td>
                <td className={ui.td}>{item.description}</td>
                <td className={ui.td}>
                  <div className={ui.tableActions}>
                    <button
                      type="button"
                      className={ui.button}
                      onClick={() => {
                        void runCatalogItem(item);
                      }}
                      disabled={!hasValidBase}
                    >
                      Run
                    </button>
                    <button
                      type="button"
                      className={ui.button}
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
