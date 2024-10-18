import {  query } from "@firebase/database";
import { getFirestore, collection, onSnapshot } from "@firebase/firestore";
import { firebaseApp } from "../config";

function App() {
  const db = getFirestore(firebaseApp);

  const q = query(collection(db, "users"));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change)
      console.log(change.type)
      if (change.type === "added") {
          console.log("New city: ", change.doc.data());
      }
      if (change.type === "modified") {
          console.log("Modified city: ", change.doc.data());
      }
      if (change.type === "removed") {
          console.log("Removed city: ", change.doc.data());
      }
    });
  });


  return (
    <ul>
      {/* <For each={store.countries}>{(country) => <li>{country.name}</li>}</For> */}
    </ul>
  );
}

export default App;
