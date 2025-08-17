function HomePage() {
  return (
    <div className='flex flex-1 flex-col gap-4 px-4 py-10'>
      <div className='mx-auto w-full max-w-4xl'>
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Добро пожаловать в Playlisto</h1>
            <p className='text-muted-foreground'>
              Выберите плейлист из списка слева или создайте новый
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <div className='h-48 rounded-xl bg-muted/50' />
            <div className='h-48 rounded-xl bg-muted/50' />
          </div>

          <div className='h-64 rounded-xl bg-muted/50' />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
