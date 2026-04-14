import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { CrudTable } from '../CrudTable';
import { LoadingSpinner, ErrorMessage } from '../../components/StatusComponents';
import { flagEmoji } from '../../utils/format';

const columns = [
  { key: 'permanent_number', label: '#' },
  { key: 'code', label: 'Code' },
  { key: 'given_name', label: 'First Name' },
  { key: 'family_name', label: 'Last Name' },
  { key: 'nationality', label: 'Nationality', render: (r) => `${flagEmoji(r.nationality)} ${r.nationality || '—'}` },
  { key: 'date_of_birth', label: 'DOB' },
  { key: 'image_url', label: 'Image', render: (r) => r.image_url ? <a href={r.image_url} target="_blank" rel="noreferrer">View</a> : '—' },
];

const formFields = [
  { key: 'driver_id', label: 'Driver ID (API)', required: true },
  { key: 'given_name', label: 'First Name', required: true },
  { key: 'family_name', label: 'Last Name', required: true },
  { key: 'code', label: 'Code (e.g. HAM)' },
  { key: 'permanent_number', label: 'Number' },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'image_url', label: 'Photo', type: 'image', folder: 'drivers' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
];

const emptyForm = {
  driver_id: '', given_name: '', family_name: '', code: '',
  permanent_number: '', date_of_birth: '', nationality: '', image_url: '', bio: '',
};

export default function AdminDrivers() {
  const { data, loading, error, refetch } = useQuery(() => db.drivers.getAll());

  async function handleSave(form) {
    const { error: err } = form.id
      ? await db.drivers.update(form.id, form)
      : await db.drivers.create(form);
    if (err) throw new Error(err.message);
    refetch();
  }

  async function handleDelete(id) {
    const { error: err } = await db.drivers.delete(id);
    if (err) throw new Error(err.message);
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Drivers ({data?.length ?? 0})</h1>
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
