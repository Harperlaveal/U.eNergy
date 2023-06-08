import { Inter } from "next/font/google";
import ThemeToggle from "./theme-toggle";

const inter = Inter({ subsets: ["latin"] });

interface TopAppBarProps {
  className?: string;
}

export default function TopAppBar({ className }: TopAppBarProps) {
  return (
    <div
      className={`flex items-center justify-between flex-grow bg-primary  w-full p-11 text-vuwGreen " + ${className}`}
    >
      <h1 className="font-bold text-4xl">U.eNergy</h1>
      <ThemeToggle />
    </div>
  );
}
