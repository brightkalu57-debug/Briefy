"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const [dropDown, setDropDown] = useState<boolean>(false);
  const pathName = usePathname();
  return (
    <nav
      className=" bg-white py-1 px-10  flex items-center 
    justify-between border-b border-gray-400 max-md:py-2.5 max-md:px-6 
    fixed right-0 left-0 z-5 "
    >
      <section>
        <Link
          href="/"
          className="flex items-center gap-2 font-[750] text-[22px] max-md:mr-13"
        >
          <img
            src="favicon.ico"
            alt="Logo"
            className="h-14 w-auto max-md:h-10"
          />
          <p className="text-indigo-800 text-[20px] font-bold">Briefy</p>
        </Link>
      </section>

      <section className="relative min-md:hidden">
        <div
          className="flex items-center  font-bold gap-2 text-indigo-800 p-2 active:border cursor-pointer select-none"
          onClick={() => setDropDown((prev) => !prev)}
        >
          Pages{" "}
          <img
            className={`h-[10px] transition-transform ${dropDown ? "-scale-y-100" : ""}`}
            src="../dropdown.png"
            alt="dropdown icon"
          />
        </div>

        {dropDown && (
          <div className="bg-white w-auto flex flex-col justify-center absolute right-0 top-13 shadow-lg rounded z-50">
            <ul className="flex flex-col justify-center font- gap-2 p-3 text-gray-600">
              <li>
                <Link
                  href="/"
                  className={`${
                    pathName === "/" ? "text-indigo-800 bg-purple-100/40" : ""
                  } block hover:text-purple-800 max-md:text-[16px] p-1 rounded`}
                  onClick={() => setDropDown(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/summarize"
                  className={`${
                    pathName === "/summarize"
                      ? "text-indigo-800 bg-purple-100/40"
                      : ""
                  } block hover:text-purple-800 max-md:text-[16px] p-1 rounded`}
                  onClick={() => setDropDown(false)}
                >
                  Summarize
                </Link>
              </li>
            </ul>
          </div>
        )}
      </section>

      <section className="max-md:hidden">
        <ul className="flex items-center font-[700] gap-4  text-gray-600 ">
          <Link
            href="/"
            className={`${pathName === "/" && "text-indigo-800"} hover:text-purple-800 gap-4 max-md:text-[16px]`}
          >
            Home
          </Link>
          <Link
            href="/summarize"
            className={`${pathName === "/summarize" && "text-indigo-800"} hover:text-purple-800 gap-4 max-md:text-[16px]`}
          >
            Summarize
          </Link>
        </ul>
      </section>
    </nav>
  );
};

export default Header;
