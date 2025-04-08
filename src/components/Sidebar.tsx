import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-6">
      <nav>
        <ul className="space-y-4">
          <li>Dashboard</li>
          <li>Saved Responses</li>
          <li>Refer a Friend</li>
          <li>Request a Feature</li>
          <li>Company News</li>
          <li>Settings</li>
        </ul>
      </nav>
    </aside>
  );
}
