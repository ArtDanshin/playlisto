'use client';

import { useState } from 'react';
import {
  User, Music, Info, LogOut, LogIn, Loader2, Database,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/Popover';
import { Separator } from '@/shared/components/ui/Separator';
import { useSpotifyStore } from '@/domains/spotifySource/store';
import { DatabaseBackup } from '@/shared/components/DatabaseBackup/DatabaseBackup';

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const {
    authStatus, isLoading, error, login, logout,
  } = useSpotifyStore();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleBackupSuccess = () => {
    setBackupError(null);
  };

  const handleBackupError = (error: string) => {
    setBackupError(error);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 data-[state=open]:bg-accent'
          title='Информация о пользователе и приложении'
        >
          <User className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-96 p-4'
        align='end'
      >
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4' />
            <span className='font-medium'>Информация о приложении</span>
          </div>

          <Separator />

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Music className='h-4 w-4' />
                <span className='text-sm'>Spotify API</span>
              </div>
              {isLoading
                ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )
                : (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        authStatus.isAuthenticated
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {authStatus.isAuthenticated ? 'Подключено' : 'Не подключено'}
                    </span>
                  )}
            </div>

            {error && (
              <div className='text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded'>
                Ошибка:
                {' '}
                {error}
              </div>
            )}

            {authStatus.isAuthenticated && authStatus.user && (
              <div className='text-xs text-muted-foreground space-y-1'>
                <div className='flex items-center gap-2'>
                  {authStatus.user.images && authStatus.user.images.length > 0 && (
                    <img
                      src={authStatus.user.images[0].url}
                      alt='Profile'
                      className='w-6 h-6 rounded-full'
                    />
                  )}
                  <div>
                    <div className='font-medium'>{authStatus.user.display_name}</div>
                    <div>{authStatus.user.email}</div>
                  </div>
                </div>
                {authStatus.expiresAt && (
                  <div>
                    Истекает:
                    {new Date(authStatus.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {!authStatus.isAuthenticated && !isLoading && (
              <div className='text-xs text-muted-foreground'>
                Для полного доступа к функциям приложения необходимо авторизоваться в Spotify
              </div>
            )}

            <div className='flex gap-2'>
              {authStatus.isAuthenticated
                ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleLogout}
                      className='flex-1'
                    >
                      <LogOut className='mr-2 h-3 w-3' />
                      Выйти из Spotify
                    </Button>
                  )
                : (
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleLogin}
                      disabled={isLoading}
                      className='flex-1'
                    >
                      {isLoading
                        ? (
                            <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                          )
                        : (
                            <LogIn className='mr-2 h-3 w-3' />
                          )}
                      Войти в Spotify
                    </Button>
                  )}
            </div>
          </div>

          <Separator />

          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4' />
              <span className='font-medium'>База данных</span>
            </div>

            <DatabaseBackup
              onSuccess={handleBackupSuccess}
              onError={handleBackupError}
            />

            {backupError && (
              <div className='text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded'>
                Ошибка:
                {' '}
                {backupError}
              </div>
            )}
          </div>

          <Separator />

          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Info className='h-3 w-3' />
            <span>Playlisto v1.0.0</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Settings;
