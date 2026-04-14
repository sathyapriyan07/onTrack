import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { CrudTable } from '../CrudTable';
import { LoadingSpinner, ErrorMessage } from '../../components/StatusComponents';

const columns = [
  { key: 'circuit_id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'locality', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'lat', label: 'Lat' },
  { key: 'long', label: 'Long' },
];

const formFields = [
  { key: 'circuit_id', label: 'Circuit ID (API)', required: true },
  { key: 'name', label: 'Name', required: true },
  { key: 'locality', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'lat', label: 'Latitude', type: 'number' },
  { key: 'long', label: 'Longitude', type: 'number' },
];

const emptyForm = { circuit_id: '', name: '', locality: '', country: '', lat: '', long: '' };

export default function AdminCircuits() {
  const { data, loading, error, refetch } = useQuery(() => db.circuits.getAll());

  async function handleSave(form) {
    const { error: err } = form.id
      ? await db.circuits.update(form.id, form)
      : await db.circuits.create(form);
    if (err) throw new Error(err.message);
    refetch();
  }

  async function handleDelete(id) {
    const { error: err } = await db.circuits.delete(id);
    if (err) throw new Error(err.message);
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Circuits ({data?.length ?? 0})</h1>
      <CrudTable
        data={data || []}
        columns={columns}
        formFields={formFields}
        emptyForm={emptyForm}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
