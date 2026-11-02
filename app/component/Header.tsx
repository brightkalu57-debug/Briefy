const Header = () => {
  return (
    <nav className="bg-blue-200/50 py-3 px-6 rounded-xl flex items-center justify-between">
      <section className="flex items-center gap-2 font-[750] text-[22px]">
        <img src="favicon.ico" alt="Logo" className="h-8 w-auto" />
        <p>Briefy</p>
      </section>
      <section>
        <ul className="flex items-center gap-4 font-[700] text-[18px]">
          <li>Home</li>
          <li>Summarize</li>
          <li>History</li>
        </ul>
      </section>
    </nav>
  );
};

export default Header;
