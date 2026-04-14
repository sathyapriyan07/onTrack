import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { CrudTable } from '../CrudTable';
import { LoadingSpinner, ErrorMessage } from '../../components/StatusComponents';
import { flagEmoji } from '../../utils/format';

const columns = [
  { key: 'constructor_id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'nationality', label: 'Nationality', render: (r) => `${flagEmoji(r.nationality)} ${r.nationality || '—'}` },
  { key: 'logo_url', label: 'Logo', render: (r) => r.logo_url ? <img src={r.logo_url} alt="" style={{ height: 30 }} /> : '—' },
];

const formFields = [
  { key: 'constructor_id', label: 'Constructor ID (API)', required: true },
  { key: 'name', label: 'Name', required: true },
  { key: 'nationality', label: 'Nationality' },
  { key: 'logo_url', label: 'Logo', type: 'image', folder: 'constructors' },
];

const emptyForm = { constructor_id: '', name: '', nationality: '', logo_url: '' };

export default function AdminConstructors() {
  const { data, loading, error, refetch } = useQuery(() => db.constructors.getAll());

  async function handleSave(form) {
    const { error: err } = form.id
      ? await db.constructors.update(form.id, form)
      : await db.constructors.create(form);
    if (err) throw new Error(err.message);
    refetch();
  }

  async function handleDelete(id) {
    const { error: err } = await db.constructors.delete(id);
    if (err) throw new Error(err.message);
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Constructors ({data?.length ?? 0})</h1>
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
