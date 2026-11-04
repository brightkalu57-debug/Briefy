import Link from "next/link";

const Header = () => {
  return (
    <nav
      className=" bg-white py-1 px-10  flex items-center 
    justify-between border-b border-gray-400  "
    >
      <section className="flex items-center gap-2 font-[750] text-[22px]">
        <img src="favicon.ico" alt="Logo" className="h-14 w-auto" />
        <p>Briefy</p>
      </section>
      <section>
        <ul className="flex items-center gap-4 font-[700] text-[18px]">
          <Link href="/">Home</Link>
          <Link href="/summarize">Summarize</Link>
          <Link href="/history">History</Link>
        </ul>
      </section>
    </nav>
  );
};

export default Header;
