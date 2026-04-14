import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { CrudTable } from '../CrudTable';
import { LoadingSpinner, ErrorMessage } from '../../components/StatusComponents';
import { formatDate } from '../../utils/format';

const columns = [
  { key: 'season', label: 'Season', render: (r) => r.seasons?.year ?? '—' },
  { key: 'round', label: 'Round' },
  { key: 'race_name', label: 'Race' },
  { key: 'circuit', label: 'Circuit', render: (r) => r.circuits?.name ?? '—' },
  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
];

const formFields = [
  { key: 'season_id', label: 'Season ID', type: 'number', required: true },
  { key: 'circuit_id', label: 'Circuit ID', type: 'number', required: true },
  { key: 'round', label: 'Round', type: 'number', required: true },
  { key: 'race_name', label: 'Race Name', required: true },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time (UTC)' },
];

const emptyForm = { season_id: '', circuit_id: '', round: '', race_name: '', date: '', time: '' };

export default function AdminRaces() {
  const { data, loading, error, refetch } = useQuery(() => db.races.getAll());

  async function handleSave(form) {
    const payload = {
      ...form,
      season_id: parseInt(form.season_id),
      circuit_id: parseInt(form.circuit_id),
      round: parseInt(form.round),
    };
    const { error: err } = form.id
      ? await db.races.update(form.id, payload)
      : await db.races.create(payload);
    if (err) throw new Error(err.message);
    refetch();
  }

  async function handleDelete(id) {
    const { error: err } = await db.races.delete(id);
    if (err) throw new Error(err.message);
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Races ({data?.length ?? 0})</h1>
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
