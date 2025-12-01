"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TransitionTable, Transition, Move as Direction } from "@/lib/types"

type SimulationStatus =
  | "IDLE"
  | "RUNNING"
  | "HALT"
  | "REJECT"
  | "ERROR"
  | "VALIDATED"

interface Simulation {
  currentTape: string[]
  headPosition: number
  currentState: string
  status: SimulationStatus
  speed: number
  initialInput: string
}

export default function Simulator() {
  const BLANK_SYMBOL = "_"

  let [states, setStates] = useState<string[]>(["q0", "q1", "halt", "reject"])
  const [initialState, setInitialState] = useState<string>(states[0])
  let [symbols, setSymbols] = useState<string[]>(["0", "1"])
  const accepted = "halt"
  const rejected = "reject"

  const allStates = useMemo(
    () => states.filter((s) => s !== accepted && s !== rejected),
    [states, accepted, rejected]
  )
  const allSymbols = useMemo(
    () => [BLANK_SYMBOL, ...symbols],
    [symbols, BLANK_SYMBOL]
  )

  const [transitionTable, setTransitionTable] = useState<TransitionTable>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  const [simState, setSimState] = useState<Simulation>({
    currentTape: [],
    headPosition: 0,
    currentState: initialState,
    status: "IDLE",
    speed: 300,
    initialInput: "010",
  })

  useEffect(() => {
    if (!allStates.includes(initialState)) {
      setInitialState(allStates[0] || "q0")
    }
  }, [allStates, initialState])

  // -- TRANSITION TABLE MANAGEMENT --

  const updateTable = useCallback(
    (currState: string, symbol: string, data: Partial<Transition>) => {
      setTransitionTable((prev) => ({
        ...prev,
        [currState]: {
          ...prev[currState],
          [symbol]: {
            write: prev[currState]?.[symbol]?.write ?? "",
            nextState: prev[currState]?.[symbol]?.nextState ?? "",
            direction: prev[currState]?.[symbol]?.direction ?? "R",
            ...data,
          },
        },
      }))
      setValidationError(null) // Clear validation on exit
      setSimState((prev) => ({
        ...prev,
        status: "IDLE",
      })) // Reset simulation status
    },
    [transitionTable]
  )

  // -- VALIDATION LOGIC --
  const validateTable = useCallback(() => {
    setValidationError(null)
    const requiredStates = new Set(allStates)
    const requiredSymbols = new Set(allSymbols)

    let isValid = true
    let errorMsg = "Transition Table is complete"

    for (const state of requiredStates) {
      for (const symbol of requiredSymbols) {
        const transition = transitionTable[state]?.[symbol]

        if (!transition) {
          isValid = false
          errorMsg = `Missing transition for state ${state}, Symbol: ${symbol}`
          break
        }

        const { write, nextState, direction } = transition

        if (!write || !nextState || !direction) {
          isValid = false
          errorMsg = `Missing transition data for State: ${state}, Symbol: ${symbol}`
          break
        }

        if (!states.includes(nextState)) {
          isValid = false
          errorMsg = `Invalid next state ${nextState} for State: ${state}, Symbol: ${symbol}`
          break
        }

        if (!["L", "R", "N"].includes(direction)) {
          isValid = false
          errorMsg = `Invalid direction ${direction} for State: ${state}, Symbol: ${symbol}`
          break
        }
      }

      if (!isValid) {
        break
      }
    }
    setValidationError(isValid ? null : errorMsg)
    setSimState((prev) => ({
      ...prev,
      status: isValid ? "VALIDATED" : "ERROR",
    }))
    return isValid
  }, [allStates, allSymbols, states, transitionTable])

  // -- SIMULATION LOGIC --
  const prepareTape = (input: string) => {
    // trim leading/trailing blanks if any
    const trimmedInput = input.trim()
    // start with a blank and the input and some blanks
    const tape = [
      BLANK_SYMBOL,
      ...trimmedInput.split(""),
      BLANK_SYMBOL,
      BLANK_SYMBOL,
      BLANK_SYMBOL,
    ]

    setSimState((prev) => ({
      ...prev,
      currentTape: tape,
      headPosition: 1,
      currentState: initialState,
      status: "IDLE",
      initialInput: input,
    }))
  }

  const stepSimulation = useCallback(() => {
    setSimState((prev) => {
      if (prev.status == "ERROR") {
        return prev
      }

      const currentSymbol = prev.currentTape[prev.headPosition] || BLANK_SYMBOL
      const transition = transitionTable[prev.currentState]?.[currentSymbol]

      if (!transition) {
        return {
          ...prev,
          status: "REJECT",
          validationError:
            "No transition defined for state " +
            prev.currentState +
            " and symbol " +
            currentSymbol,
        }
      }

      const { write, nextState, direction } = transition

      const newTape = [...prev.currentTape]
      newTape[prev.headPosition] = write

      let newHeadPos = prev.headPosition
      if (direction == "R") {
        newHeadPos++
      } else if (direction == "L") {
        newHeadPos--
      }

      if (newHeadPos < 0) {
        newTape.unshift(BLANK_SYMBOL)
        newHeadPos = 0
      } else if (newHeadPos >= newTape.length) {
        newTape.push(BLANK_SYMBOL)
      }

      let newStatus: SimulationStatus = "RUNNING"
      if (nextState == accepted) {
        newStatus = "HALT"
      } else if (nextState == rejected) {
        newStatus = "REJECT"
      }

      return {
        ...prev,
        currentTape: newTape,
        headPosition: newHeadPos,
        currentState: nextState,
        status: newStatus,
      }
    })
  }, [transitionTable, accepted, rejected, BLANK_SYMBOL])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (simState.status == "RUNNING" && simState.speed > 0) {
      console.log("RUNNING")
      timer = setInterval(() => {
        // Call stepSimulation directly. stepSimulation uses setSimState(prev => ...)
        // which ensures it reads the latest state and updates it atomically.
        stepSimulation()
      }, simState.speed)
    }
    return () => clearInterval(timer)
  }, [simState.status, simState.speed, stepSimulation])

  const handleRun = () => {
    if (validateTable()) {
      prepareTape(simState.initialInput)
      setSimState((prev) => ({
        ...prev,
        status: "RUNNING",
        currentState: initialState,
      }))
    }
  }

  const handleReset = () => {
    prepareTape(simState.initialInput)
    setSimState((prev) => ({
      ...prev,
      status: "IDLE",
      currentState: initialState,
    }))
  }

  // -- UI RENDER --
  const getStatusClass = (status: SimulationStatus) => {
    console.log(status)
    switch (status) {
      case "HALT":
        return "border-halted text-halted"
      case "RUNNING":
        return "border-running text-running"
      case "REJECT":
        return "border-rejected text-rejected"
      case "VALIDATED": 
        return "border-validated text-validated"
      case "IDLE":
        return "border-idle text-idle"
      case "ERROR":
        return "border-error text-error"
      default:
        return "border-background text-background"
    }
  }

  return (
    <div className="font-geist-mono flex min-h-screen bg-background font-mono text-foreground items-center justify-center w-screen">
      <main className="flex z-10 w-full max-w-7xl flex-col rounded-[0.1em] items-center justify-center p-4">
        <h1 className="max-w-7xl w-full text-center text-2xl p-4 bg-accent text-white font-extrabold rounded-t-[0.1em] shadow-xl">
          2-RNG: Universal Turing Machine Simulator
        </h1>

        {/* Status Indicator and Tape Display */}
        <div className="w-full border-2 border-accent p-6 mb-6 flex flex-col items-center rounded-b-[0.1em]">
          <div
            className={`p-2 px-4 border-2 rounded-[0.2em] text-sm font-bold shadow-md ${getStatusClass(
              simState.status
            )}`}
          >
            STATUS: {simState.status.replace("_", " ")} (Q:{" "}
            {simState.currentState})
          </div>

          <h2 className="text-xl font-bold mt-4 mb-2">TAPE</h2>
          <div className="flex items-center overflow-x-auto p-2 border-2 border-accent h-20 max-h-20 rounded-none shadow-inner w-full">
            {simState.currentTape.map((symbol, index) => (
              <div
                key={index}
                className={`p-3 py-4 mx-1 text-lg font-bold w-12 text-center rounded-none shadow-[0_0_0.25em] shadow-accent transition-all duration-150 ease-in-out
                            ${
                              index === simState.headPosition
                                ? "bg-accent text-white text-shadow-[0_0_0.2em] text-shadow-white"
                                : "border-accent border-2 text-accent text-shadow-[0_0_0.2em] text-shadow-primary"
                            }`}
              >
                {symbol}
              </div>
            ))}
          </div>
          {simState.status === "ERROR" && validationError && (
            <p className="mt-4 p-2 bg-red-500 text-white text-shadow-[0_0_0.2em] text-shadow-white rounded-none shadow-md shadow-red-400 font-semibold w-full text-center">
              {validationError}
            </p>
          )}
        </div>

        <div className="max-w-7xl w-full grid md:grid-cols-4 grid-cols-1 gap-6">
          {/* SIMULATION CONTROLS */}
          <div className="md:col-span-1 p-4 border-2 border-accent rounded-[0.2em] shadow-lg shadow-accent">
            <h2 className="text-xl text-accent text-shadow-[0_0_0.5em] text-shadow-accent font-bold mb-4 pb-2 ">
              Simulation Controls
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-foreground">
                Initial Input Tape
              </label>
              <Input
                value={simState.initialInput}
                onChange={(e) =>
                  setSimState((prev) => ({
                    ...prev,
                    initialInput: e.target.value,
                  }))
                }
                placeholder="e.g., 0101"
                disabled={simState.status === "RUNNING"}
                className="uppercase"
              />
              <p className="text-xs mt-1 text-foreground">
                Only use symbols from the tape symbols.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Execution Speed (ms)
              </label>
              <Input
                type="number"
                value={simState.speed}
                onChange={(e) =>
                  setSimState((prev) => ({
                    ...prev,
                    speed: parseInt(e.target.value) || 100,
                  }))
                }
                min="50"
                max="2000"
                disabled={simState.status === "RUNNING"}
              />
            </div>

            <button
              onClick={handleRun}
              className={`w-full py-3 px-4 rounded-lg font-bold mb-3 transition-colors duration-300 shadow-md
                ${
                  simState.status === "RUNNING"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-600 hover:bg-green-700"
                }
              `}
              disabled={simState.status === "RUNNING"}
            >
              {simState.status === "RUNNING" ? "Running..." : "Run Simulation"}
            </button>

            <button
              onClick={stepSimulation}
              className={`w-full py-3 px-4 rounded-lg font-bold mb-3 transition-colors duration-300 shadow-md ${
                simState.status === "RUNNING"
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={
                simState.status !== "VALIDATED" &&
                simState.status !== "IDLE" &&
                simState.status !== "RUNNING"
              }
            >
              Step
            </button>

            <button
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-lg font-bold bg-red-500 hover:bg-red-600 transition-colors duration-300 shadow-md"
            >
              Reset
            </button>

            <button
              onClick={validateTable}
              className="w-full py-2 px-4 rounded-lg font-semibold mt-4 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors duration-300"
            >
              {validationError ? "Re-Validate Machine" : "Validate Machine"}
            </button>
          </div>

          {/* STATES MANAGEMENT */}
          <div className="md:col-span-1 p-4 bg-background border-2 shadow-lg shadow-accent border-accent rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-shadow-[0_0_0.5em] text-shadow-accent pb-2 text-accent">
              States & Alphabet
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Initial State (Q0)
              </label>
              <Select value={initialState} onValueChange={setInitialState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Initial State" />
                </SelectTrigger>
                <SelectContent>
                  {allStates.map((s, idx) => (
                    <SelectItem key={idx} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Normal States
              </label>
              <div className="max-h-32 overflow-y-auto pr-2">
                {allStates.map((state, index) => (
                  <div key={index} className="flex flex-row items-center mb-2">
                    <Input
                      maxLength={8}
                      type="text"
                      value={state}
                      onChange={(e) => {
                        if (e.target.value.trim() === "") return
                        const newStates = [...states]
                        const oldIndex = states.indexOf(state)
                        // Update the state array, excluding terminal states
                        newStates[oldIndex] = e.target.value.replace(
                          /[^a-zA-Z0-9]/g,
                          ""
                        ) // Basic sanitization
                        setStates(newStates)
                      }}
                      className="w-full mr-2"
                    />
                    <button
                      className="bg-red-500 text-white p-2 text-xs rounded hover:bg-red-600 transition-colors"
                      onClick={() =>
                        setStates(states.filter((s) => s !== state))
                      }
                      disabled={allStates.length === 1}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="bg-indigo-600 border-2 border-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 transition-colors duration-300 w-full rounded-lg mt-2"
                onClick={() => setStates([...states, `q${allStates.length}`])}
              >
                Add State
              </button>
            </div>

            {/* Alphabet */}
            <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Tape Alphabet</h3>
              <p className="text-sm font-medium mb-1">
                Input Symbols (excluding Blank: **{BLANK_SYMBOL}**)
              </p>
              <div className="max-h-100% overflow-y-auto pr-2">
                {symbols.map((symbol, index) => (
                  <div key={index} className="flex flex-row items-center mb-2">
                    <Input
                      maxLength={1}
                      type="text"
                      value={symbol}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().charAt(0)
                        if (!val || val === BLANK_SYMBOL) return // Prevent empty or blank symbol
                        const newAlphabet = [...symbols]
                        newAlphabet[index] = val
                        setSymbols(newAlphabet)
                      }}
                      className="w-full mr-2 uppercase text-center font-bold"
                    />
                    <button
                      className="bg-red-500 text-white p-2 text-xs rounded hover:bg-red-600 transition-colors"
                      onClick={() =>
                        setSymbols(symbols.filter((_, i) => i !== index))
                      }
                      disabled={symbols.length === 0}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="bg-indigo-600 border-2 border-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 transition-colors duration-300 w-full rounded-lg mt-2"
                onClick={() => setSymbols([...symbols, `_`])}
                disabled={symbols.length >= 5} // Limit for table readability
              >
                Add Symbol
              </button>
            </div>
          </div>

          {/* TRANSITION TABLE */}
          <div className="md:col-span-2 p-4 border-2 border-accent rounded-lg shadow-accent shadow-lg overflow-x-auto min-w-0">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
              Transition Table $\delta(q, a)$
            </h2>

            <div className="overflow-x-auto pb-4">
              <table className="w-full table-auto border-collapse border border-gray-500 dark:border-gray-600">
                <thead>
                  <tr>
                    <th className="border border-gray-500 p-2 min-w-[100px] text-center">
                      State / Symbol
                    </th>
                    {allStates.map((s) => (
                      <th
                        key={s}
                        className="border border-gray-500 p-2 min-w-[120px] max-w-[150px] text-center"
                      >
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSymbols.map((symbol) => (
                    <tr
                      key={symbol}
                      className="hover:bg-muted"
                    >
                      <td className="border border-gray-500 p-2 text-center font-bold">
                        {symbol === BLANK_SYMBOL
                          ? `BLANK (${BLANK_SYMBOL})`
                          : symbol}
                      </td>
                      {allStates.map((s) => (
                        <td
                          key={s}
                          className="border border-gray-500 p-2 align-top text-xs space-y-1"
                        >
                          {/* Each cell contains Write, Next State, Direction */}
                          <div className="font-semibold mb-1">{`Write (${symbol})`}</div>
                          <Input
                            maxLength={1}
                            placeholder="WRITE"
                            value={transitionTable[s]?.[symbol]?.write ?? ""}
                            onChange={(e) =>
                              updateTable(s, symbol, {
                                write: e.target.value.toUpperCase().charAt(0),
                              })
                            }
                            className="text-center font-bold uppercase"
                          />
                          <div className="font-semibold mt-2 mb-1">
                            Next State
                          </div>
                          <Select
                            value={
                              transitionTable[s]?.[symbol]?.nextState ??
                              accepted
                            }
                            onValueChange={(value) =>
                              updateTable(s, symbol, { nextState: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Next State" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((nextS, idx) => (
                                <SelectItem key={idx} value={nextS}>
                                  {nextS}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="font-semibold mt-2 mb-1">
                            Direction
                          </div>
                          <Select
                            value={
                              transitionTable[s]?.[symbol]?.direction ?? "R"
                            }
                            onValueChange={(value) =>
                              updateTable(s, symbol, {
                                direction: value as Direction,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Direction" />
                            </SelectTrigger>
                            <SelectContent>
                              {["L", "R", "S"].map((dir) => (
                                <SelectItem key={dir} value={dir}>
                                  {dir === "L"
                                    ? "LEFT"
                                    : dir === "R"
                                    ? "RIGHT"
                                    : "STAY"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Terminal States Row - No transitions needed from these */}
                  <tr className="font-semibold">
                    <td className="border border-gray-500 p-2 text-center">
                      Halted States
                    </td>
                    {allStates.map((s) => (
                      <td
                        key={s}
                        className="border border-gray-500 p-2 text-center text-gray-500"
                      >
                        N/A
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
