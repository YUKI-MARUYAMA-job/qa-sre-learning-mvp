type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <section className="panel">
      <h2>読み込みエラー</h2>
      <p className="error">{message}</p>
    </section>
  );
}
