import { atom } from "recoil";

const focusedContextAtom = atom({
  key: "focusedContextAtom",
  default: null
});

export default focusedContextAtom;
