import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { CrudTable } from '../CrudTable';
import { LoadingSpinner, ErrorMessage } from '../../components/StatusComponents';

const columns = [
  { key: 'year', label: 'Year' },
];

const formFields = [
  { key: 'year', label: 'Year', type: 'number', required: true },
];

const emptyForm = { year: '' };

export default function AdminSeasons() {
  const { data, loading, error, refetch } = useQuery(() => db.seasons.getAll());

  async function handleSave(form) {
    const payload = { year: parseInt(form.year) };
    const { error: err } = form.id
      ? await db.seasons.update(form.id, payload)
      : await db.seasons.create(payload);
    if (err) throw new Error(err.message);
    refetch();
  }

  async function handleDelete(id) {
    const { error: err } = await db.seasons.delete(id);
    if (err) throw new Error(err.message);
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Seasons ({data?.length ?? 0})</h1>
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
