import { AvatarMaker } from "@/components/avatar-maker"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f3efe8]">
      <header className="border-b border-foreground/5 bg-[#faf7f2]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-6">
          <div className="text-2xl font-semibold tracking-[0.35em]">WHIMSY</div>
          <p className="text-sm tracking-wide text-muted-foreground">Avatar Maker</p>
        </div>
      </header>
      <AvatarMaker />
    </main>
  )
}
