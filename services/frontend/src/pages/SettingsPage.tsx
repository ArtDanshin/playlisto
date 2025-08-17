import { DatabaseBackup } from '@/domains/playlists/components/DatabaseBackup';

function SettingsPage() {
  return (
    <div className='flex flex-1 flex-col gap-4 px-4 py-10'>
      <div className='mx-auto w-full max-w-4xl space-y-6'>
        <div className='flex items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Настройки</h1>
            <p className='text-muted-foreground'>
              Управление данными приложения
            </p>
          </div>
        </div>

        <DatabaseBackup />
      </div>
    </div>
  );
}

export default SettingsPage;
