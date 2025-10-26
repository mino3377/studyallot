export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>新規教材追加</h1>
      <div>{children}</div>
    </div>
  );
}
