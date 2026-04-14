type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header>
      <h1 className="m-0 text-[32px] leading-[1.1] font-bold">{title}</h1>
    </header>
  );
}
