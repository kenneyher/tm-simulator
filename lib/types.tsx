export type Move = "L" | "R";

export interface Transition {
  nextState: string;
  write: string;
  direction: Move;
}

export interface TransitionTable {
  [state: string]: {
    [symbol: string]: Transition;
  }
}

export interface MachineConfig {
  states: string[];
  alphabet: string[];
  tapeAlphabet: string[];
  transitions: TransitionTable;
  startState: string;
  acceptState: string;
  rejectState: string;
}