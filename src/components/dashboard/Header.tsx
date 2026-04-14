type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header>
      <h1 style={styles.title}>{title}</h1>
    </header>
  );
}

const styles = {
  title: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.1,
    fontWeight: 700,
  },
} as const;
