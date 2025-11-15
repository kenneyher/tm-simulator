import { TuringMachine } from "./machine";
import { MachineConfig } from "./types";

const config: MachineConfig = {
  states: ["q0", "halt"],
  alphabet: ["0", "1"],
  tapeAlphabet: ["1", "X", "_"],
  transitions: {
    "q0": {
      "1": { nextState: "q0", write: "X", direction: "R" },
      "_": { nextState: "halt", write: "_", direction: "R" }
    },
    "halt": {},
    "reject": {}
  },
  startState: "q0",
  acceptState: "halt",
  rejectState: "reject"
};

let tm: TuringMachine = new TuringMachine(config, "1111");

while (!tm.halted()) {
  tm.step();
  console.log(tm.tape.join(""), tm.head, tm.currentState);
} 

