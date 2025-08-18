'use client';

import { useState } from 'react';
import {
  Music, Eye, EyeOff, Save, Loader2, AlertCircle,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';

import { useSpotifyStore } from '../../store';

function Settings() {
  const {
    authStatus, login, logout, saveClientId, error, clientId,
  } = useSpotifyStore();

  const [inputClientId, setInputClientId] = useState(clientId);
  const [showClientId, setShowClientId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setSuccess(null);
    setIsSaving(true);

    try {
      await saveClientId(inputClientId.trim());
      setSuccess('Spotify Client ID успешно сохранен');
    } catch {
      // Ошибка уже обработана в store
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async () => {
    if (!inputClientId.trim()) {
      return;
    }

    try {
      await login();
    } catch {
      // Ошибка уже обработана в store
    }
  };

  const handleLogout = () => {
    logout();
    setSuccess('Выход из Spotify выполнен');
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Music className='h-4 w-4' />
        <span className='font-medium'>Spotify API</span>
      </div>

      <div className='space-y-4'>
        {/* Client ID Input */}
        <div className='space-y-2'>
          <Label htmlFor='spotify-client-id'>Spotify Client ID</Label>
          <div className='relative'>
            <Input
              id='spotify-client-id'
              type={showClientId ? 'text' : 'password'}
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              placeholder='Введите ваш Spotify Client ID'
              className='pr-10'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3'
              onClick={() => setShowClientId(!showClientId)}
            >
              {showClientId
                ? (
                    <EyeOff className='h-4 w-4' />
                  )
                : (
                    <Eye className='h-4 w-4' />
                  )}
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            Получите Client ID в{' '}
            <a
              href='https://developer.spotify.com/dashboard'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              Spotify Developer Dashboard
            </a>
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !inputClientId.trim()}
          className='w-full'
        >
          {isSaving
            ? (
                <Loader2 className='mr-2 h-3 w-3 animate-spin' />
              )
            : (
                <Save className='mr-2 h-3 w-3' />
              )}
          Сохранить Client ID
        </Button>

        {/* Auth Status and Actions */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <span className='font-medium'>Статус авторизации:</span>
            <span className={authStatus.isAuthenticated ? 'text-green-600' : 'text-gray-500'}>
              {authStatus.isAuthenticated ? 'Авторизован' : 'Не авторизован'}
            </span>
          </div>

          {authStatus.user && (
            <div className='text-sm text-muted-foreground'>
              Пользователь: {authStatus.user.display_name}
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
                    Выйти из Spotify
                  </Button>
                )
              : (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleLogin}
                    disabled={!inputClientId.trim()}
                    className='flex-1'
                  >
                    Войти в Spotify
                  </Button>
                )}
          </div>
        </div>

        {/* Info */}
        <div className='text-xs text-muted-foreground'>
          <div className='flex items-start gap-2'>
            <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
            <div>
              <p className='font-medium'>Важно!</p>
              <p>
                Client ID сохраняется локально в вашем браузере. После изменения Client ID
                необходимо выполнить повторный вход в Spotify.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded'>
          Ошибка: {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className='text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded'>
          {success}
        </div>
      )}
    </div>
  );
}

export default Settings;
