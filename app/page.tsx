import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-between bg-background font-sans">
      <main className="flex z-10 min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-background sm:items-start">
        <div className="z-10">
          <h1 className="mb-8 text-5xl font-mono font-bold text-foreground sm:text-6xl">
            Hello there,
          </h1>
          <h1 className="mb-8 text-5xl font-mono font-bold text-foreground sm:text-6xl">
            I am 2-RNG.
          </h1>
          <h3 className="font-mono text-foreground max-w-lg text-lg sm:text-xl mb-12">
            Your friendly and amazing Turing Machine simulator made by Kenito.
          </h3>

          <Link href="/simulator" className="mt-15 border-2 border-accent px-6 py-3 font-mono text-lg font-medium text-accent hover:bg-accent
          hover:text-white transition-colors duration-300">
            Get Started
          </Link>
        </div>

      </main>
        <div className="fixed inset-0 z-0 size-full bg-accent" />
    </div>
  )
}
