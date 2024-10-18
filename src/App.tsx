import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@firebase/firestore";
import { firebaseApp } from "../config";
import { firebaseConnector, useWatcher } from "./watcher";
import { For } from "solid-js";

function App() {
  const db = getFirestore(firebaseApp);
  const q = query(collection(db, "countries"), where("name", "==", "rance"));
  const { store } = useWatcher(
    db,
    ["countries", ["countries_where", "countries", q]],
    firebaseConnector
  );

  return (
    <div>
      <h1>countries</h1>
      <ul>
        <For each={store.countries?.map((s) => s.data())}>
          {(country) => <li>{country.name}</li>}
        </For>
      </ul>
      <h1>countries_where</h1>
      <ul>
        <For each={store.countries_where?.map((s) => s.data())}>
          {(country) => <li>{country.name}</li>}
        </For>
      </ul>
    </div>
  );
}

export default App;
