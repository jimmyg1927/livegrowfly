import React from "react";


type HeaderProps = {
  name: string;
};

export default function Header({ name }: HeaderProps) {
  return (
    <header className="bg-gray-100 p-4 border-b border-gray-300">
      <h1 className="text-xl font-semibold">Hey {name}, what can we do for you today?</h1>
    </header>
  );
}
