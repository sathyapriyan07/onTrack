export function LoadingSpinner() {
  return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
}

export function ErrorMessage({ message }) {
  return (
    <div style={{ padding: '1rem', color: 'red', border: '1px solid red', borderRadius: 4 }}>
      Error: {message}
    </div>
  );
}

export function EmptyState({ message = 'No data found.' }) {
  return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>{message}</div>;
}
