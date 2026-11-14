"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathName = usePathname();
  return (
    <nav
      className=" bg-white py-1 px-10  flex items-center width-[100%]
    justify-between border-b border-gray-400 max-md:py-3.5 "
    >
      <section>
        <Link
          href="/"
          className="flex items-center gap-2 font-[750] text-[22px] max-md:mr-13"
        >
          <img
            src="favicon.ico"
            alt="Logo"
            className="h-14 w-auto max-md:hidden"
          />
          <p className="text-indigo-800">Briefy</p>
        </Link>
      </section>
      <section>
        <ul className="flex items-center gap-4 font-[700] text-[18px] text-gray-600 ">
          <Link
            href="/"
            className={`${pathName === "/" && "text-purple-600"} hover:text-purple-800`}
          >
            Home
          </Link>
          <Link
            href="/summarize"
            className={`${pathName === "/summarize" && "text-purple-600"} hover:text-purple-800`}
          >
            Summarize
          </Link>
        </ul>
      </section>
    </nav>
  );
};

export default Header;
