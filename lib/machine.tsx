import { MachineConfig } from "./types";

export class TuringMachine {
  tape: string[];
  head: number;
  currentState: string;
  config: MachineConfig;

  constructor(config: MachineConfig, input: string) {
    this.tape = [...input];
    this.head = 0;
    this.currentState = config.startState;
    this.config = config;
  }

  step(): boolean {
    const symbol = this.tape[this.head] ?? "_";
    const rule = this.config.transitions[this.currentState]?.[symbol];

    if (!rule) {
      throw new Error(
        `No transition for state "${this.currentState}" reading "${symbol}".`
      );
    }

    this.tape[this.head] = rule.write;
    this.head += rule.direction == "R" ? 1 : -1;
    
    if (this.head < 0) {
      this.tape.unshift("_");
      this.head = 0;
    } else if (this.head >= this.tape.length) {
      this.tape.push("_");
    }
    
    this.currentState = rule.nextState;

    return true; // Transition successful
  }

  halted(): boolean {
    return (
      this.currentState === this.config.acceptState ||
      this.currentState === this.config.rejectState
    );
  }
}