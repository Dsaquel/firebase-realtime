import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  onSnapshot,
  collection,
  query,
  Firestore,
  Query,
  DocumentData,
} from "@firebase/firestore";

type QueryType<X> = [string, string, X];

type TableSelector<X> = string | QueryType<X>;

type ClientProvider<T, X> = (
  client: T,
  tables: TableSelector<X>[],
  set: SetStoreFunction<Record<string, any[]>>
) => void;

export const supaConnector: ClientProvider<
  SupabaseClient,
  () => Promise<any[]>
> = (client, tables, set) => {
  let tablesMap = new Map<string, string[]>();

  set(
    produce(async (state) => {
      for (const tableSelector of tables) {
        let customTable, query, table: string;
        if (typeof tableSelector !== "string") {
          customTable = tableSelector[0];
          table = tableSelector[1];
          query = tableSelector[2];
        } else {
          customTable = tableSelector;
          table = tableSelector;
          query = async () => (await client.from(table).select()).data!;
        }

        tablesMap.get(table)?.push(customTable) ||
          tablesMap.set(table, [customTable]);
        state[customTable] = await query();
      }
    })
  );

  client
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
      },
      (payload) => {
        set(
          produce((state) => {
            for (const customTable of tablesMap.get(payload.table) ?? []) {
              if (payload.eventType === "INSERT") {
                state[customTable].push(payload.new);
              } else if (payload.eventType === "UPDATE") {
                const idx = state[customTable].findIndex(
                  (s) => s.id === payload.new.id
                );
                if (idx === -1) return;
                state[customTable][idx] = payload.new;
              } else {
                const idx = state[customTable].findIndex(
                  (s) => s.id === payload.old.id
                );
                if (idx === -1) return;
                state[customTable].splice(idx, 1);
              }
            }
          })
        );
      }
    )
    .subscribe();
};

export const firebaseConnector: ClientProvider<
  Firestore,
  Query<DocumentData, DocumentData>
> = (db, tables, set) => {
  for (const selector of tables) {
    let q;
    let customTable;

    if (typeof selector === "string") {
      customTable = selector;
      q = query(collection(db, selector));
    } else {
      customTable = selector[0];
      q = selector[2];
    }

    set(customTable, []);

    onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        console.log(change.type);
        set(
          produce((state) => {
            if (change.type === "added") {
              state[customTable].push(change.doc);
            }
            if (change.type === "modified") {
              const idx = state[customTable].findIndex(
                (s) => s.id === change.doc.id
              );
              if (idx === -1) return;
              state[customTable][idx] = change.doc;
            }
            if (change.type === "removed") {
              const idx = state[customTable].findIndex(
                (s) => s.id === change.doc.id
              );
              if (idx === -1) return;
              state[customTable].splice(idx, 1);
            }
          })
        );
      });
    });
  }
};

export function useWatcher<T, X>(
  client: T,
  tables: TableSelector<X>[],
  clientProvider: ClientProvider<T, X> = supaConnector as any
) {
  const [store, setStore] = createStore<Record<string, any[]>>({});

  clientProvider(client, tables, setStore);

  return {
    store,
  };
}
