"use client"
import { useState } from "react"

export default function Simulator() {
  let [states, setStates] = useState<string[]>(["q0", "halt", "reject"])
  let [accepted, setAccepted] = useState<string>(states[1])
  let [rejected, setRejected] = useState<string>(states[2])

  return (
    <div className="flex min-h-screen bg-background font-mono text-foreground items-center justify-center">
      <main className="flex z-10 min-h-screen w-full max-w-6xl flex-col items-center justify-start py-32 px-16 sm:items-start">
        <h1 className="w-full text-lg p-2 bg-accent text-foreground font-bold shadow-lg shadow-accent/40">
          Turing Machine Simulator
        </h1>
        <div className="w-full mt-8 grid grid-cols-[max-content_1fr] gap-4">
          <div className="border-2 col-span-2 border-foreground p-4">
            <h2 className="font-bold mb-4 ">Simulation Controls</h2>
          </div>
          {/* States management UI goes here */}
          <div className="border-2 max-w-[300px] border-foreground p-4">
            <h2 className="font-bold mb-4">States</h2>
            {states.map((state, index) => (
              <div key={index} className="flex flex-row justify-between mb-2">
                <input
                  type="text"
                  value={state}
                  onChange={(e) => {
                    const newStates = [...states]
                    newStates[index] = e.target.value
                    setStates(newStates)
                  }}
                  className="border-2 border-foreground bg-background text-foreground p-1 w-full"
                />
                <button
                  className="ml-4 bg-background border-2 border-accent px-4 text-muted hover:bg-accent
                hover:text-white transition-colors duration-300"
                  onClick={() => {
                    setStates(states.filter((_, i) => i !== index))
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex flex-row justify-between my-4">
              <button
                className="bg-accent border-2 border-accent py-2 px-4 text-foreground hover:bg-background
              hover:text-white transition-colors duration-300 shadow-lg shadow-accent/40 w-full"
                onClick={() => setStates([...states, `q${states.length - 2}`])}
              >
                Add State
              </button>
            </div>

            <h2 className="font-bold mb-4">Accept State</h2>
            <select
              name="accept"
              id="accept"
              className="border-2 focus:rounded-none border-foreground bg-background text-foreground p-2 w-full mb-4"
              value={accepted}
              onChange={(e) => {
                const newAccept = e.target.value
                setAccepted(newAccept)
              }}
            >
              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <h2 className="font-bold mb-4">Reject State</h2>
            <select
              name="accept"
              id="accept"
              className="border-2 focus:rounded-none border-foreground bg-background text-foreground p-2 w-full mb-4"
              value={rejected}
              onChange={(e) => {
                if (e.target.value === accepted) return
                const newReject = e.target.value
                setRejected(newReject)
              }}
            >
              {states.map((state, index) => {
                if (state === accepted) return null
                return (
                  <option key={index} value={state}>
                    {state}
                  </option>
                )
              })}
            </select>
          </div>
          {/* Simulation controls go here */}
          <div className="border-2 border-foreground p-4">
            <h2 className="font-bold mb-4">Transition Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-foreground">
                <thead>
                  <tr>
                    <th className="border border-foreground p-2">Symbol</th>
                    <th className="border border-foreground p-2">State</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Transition rows go here */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
