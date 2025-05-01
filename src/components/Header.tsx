'use client'

type HeaderProps = {
  name: string
}

export default function Header({ name }: HeaderProps) {
  return (
    <div className="w-full flex justify-between items-center mb-6 px-6">
      <h1 className="text-2xl font-semibold text-white">Welcome, {name}</h1>
      <div className="text-sm text-gray-400">Logged in as: Growfly User</div>
    </div>
  )
}
