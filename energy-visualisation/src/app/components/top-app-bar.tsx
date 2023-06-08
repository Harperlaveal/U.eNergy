import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function TopAppBar() {
  return (
    <header className="flex items-center h-24">
      <div className="flex bg-vuwGreen h-full items-center justify-center w-[15%]">
        <Image
          src="/unplugged-logo.png "
          alt="Unplugged Logo"
          width={150}
          height={150}
        />
      </div>

      <div className="flex items-center flex-grow bg-primary h-full w-full p-4 text-vuwGreen pl-11">
        <h1 className="font-bold text-4xl">U.eNergy</h1>
      </div>
    </header>
  );
}
