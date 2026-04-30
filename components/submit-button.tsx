export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit" className="btn btn--primary">
      {children}
    </button>
  );
}
