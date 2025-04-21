import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="bg-black text-white w-64 p-6 flex flex-col space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Growfly</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          </li>
          <li>
            <Link href="/change-plan" className="hover:text-blue-400">Change Plan</Link>
          </li>
          <li>
            <Link href="/settings" className="hover:text-blue-400">Settings</Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
