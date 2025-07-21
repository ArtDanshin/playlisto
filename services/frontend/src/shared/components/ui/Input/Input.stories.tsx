import { useState } from 'react';
import {
  Search, Mail, Lock, User, Eye, EyeOff, Calendar,
} from 'lucide-react';

import Label from '../Label/Label';
import Button from '../Button/Button';

import Input from './Input';

export default {
  title: 'Shared/UI/Input',
  component: Input,
};

// Базовый input
export const Default = {
  args: {
    placeholder: 'Введите текст',
  },
};

// Различные типы
export const Types = {
  render: () => (
    <div className='grid gap-4 max-w-md'>
      <div>
        <Label htmlFor='text'>Текст</Label>
        <Input id='text' type='text' placeholder='Введите текст' />
      </div>
      <div>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' type='email' placeholder='example@email.com' />
      </div>
      <div>
        <Label htmlFor='password'>Пароль</Label>
        <Input id='password' type='password' placeholder='••••••••' />
      </div>
      <div>
        <Label htmlFor='number'>Число</Label>
        <Input id='number' type='number' placeholder='123' />
      </div>
      <div>
        <Label htmlFor='tel'>Телефон</Label>
        <Input id='tel' type='tel' placeholder='+7 (999) 123-45-67' />
      </div>
      <div>
        <Label htmlFor='url'>URL</Label>
        <Input id='url' type='url' placeholder='https://example.com' />
      </div>
      <div>
        <Label htmlFor='date'>Дата</Label>
        <Input id='date' type='date' />
      </div>
      <div>
        <Label htmlFor='time'>Время</Label>
        <Input id='time' type='time' />
      </div>
      <div>
        <Label htmlFor='search'>Поиск</Label>
        <Input id='search' type='search' placeholder='Поиск...' />
      </div>
    </div>
  ),
};

// Состояния
export const States = {
  render: () => (
    <div className='grid gap-4 max-w-md'>
      <div>
        <Label htmlFor='normal'>Обычное</Label>
        <Input id='normal' placeholder='Обычное поле' />
      </div>
      <div>
        <Label htmlFor='disabled'>Отключено</Label>
        <Input id='disabled' placeholder='Отключенное поле' disabled />
      </div>
      <div>
        <Label htmlFor='readonly'>Только чтение</Label>
        <Input id='readonly' value='Только для чтения' readOnly />
      </div>
      <div>
        <Label htmlFor='required'>Обязательное</Label>
        <Input id='required' placeholder='Обязательное поле' required />
      </div>
      <div>
        <Label htmlFor='error'>С ошибкой</Label>
        <Input id='error' placeholder='Поле с ошибкой' aria-invalid='true' />
      </div>
    </div>
  ),
};

// С иконками (имитация)
export const WithIcons = {
  render: () => (
    <div className='grid gap-4 max-w-md'>
      <div>
        <Label htmlFor='search-icon'>Поиск</Label>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            id='search-icon'
            placeholder='Поиск...'
            className='pl-10'
          />
        </div>
      </div>

      <div>
        <Label htmlFor='email-icon'>Email</Label>
        <div className='relative'>
          <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            id='email-icon'
            type='email'
            placeholder='example@email.com'
            className='pl-10'
          />
        </div>
      </div>

      <div>
        <Label htmlFor='user-icon'>Имя пользователя</Label>
        <div className='relative'>
          <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            id='user-icon'
            placeholder='username'
            className='pl-10'
          />
        </div>
      </div>
    </div>
  ),
};

// Интерактивный пример с валидацией
export const WithValidation = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password === '' || password.length >= 8;
    const doPasswordsMatch = confirmPassword === '' || password === confirmPassword;

    return (
      <div className='space-y-4 max-w-md'>
        <div>
          <Label htmlFor='reg-email'>Email *</Label>
          <Input
            id='reg-email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='example@email.com'
            aria-invalid={!isEmailValid}
          />
          {!isEmailValid && (
            <p className='text-sm text-destructive mt-1'>
              Введите корректный email адрес
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='reg-password'>Пароль *</Label>
          <Input
            id='reg-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Минимум 8 символов'
            aria-invalid={!isPasswordValid}
          />
          {!isPasswordValid && (
            <p className='text-sm text-destructive mt-1'>
              Пароль должен содержать минимум 8 символов
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='reg-confirm'>Подтвердите пароль *</Label>
          <Input
            id='reg-confirm'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Повторите пароль'
            aria-invalid={!doPasswordsMatch}
          />
          {!doPasswordsMatch && (
            <p className='text-sm text-destructive mt-1'>
              Пароли не совпадают
            </p>
          )}
        </div>

        <Button
          disabled={!isEmailValid || !isPasswordValid || !doPasswordsMatch || !email || !password}
          className='w-full'
        >
          Зарегистрироваться
        </Button>
      </div>
    );
  },
};

// Поиск с кнопкой
export const SearchInput = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
      <div className='max-w-md space-y-4'>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Поиск товаров...'
              className='pl-10'
            />
          </div>
          <Button>Найти</Button>
        </div>

        {/* Компактная версия */}
        <div className='flex border rounded-md'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Поиск...'
              className='pl-10 border-0 rounded-r-none focus-visible:ring-0'
            />
          </div>
          <Button className='rounded-l-none border-l-0'>
            Поиск
          </Button>
        </div>
      </div>
    );
  },
};

// Формы различных размеров
export const FormLayouts = {
  render: () => (
    <div className='space-y-8 max-w-2xl'>
      {/* Компактная форма */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Компактная форма</h3>
        <div className='flex gap-2'>
          <Input placeholder='Имя' className='flex-1' />
          <Input placeholder='Фамилия' className='flex-1' />
          <Button>Сохранить</Button>
        </div>
      </div>

      {/* Стандартная форма */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Стандартная форма</h3>
        <div className='space-y-3'>
          <div>
            <Label htmlFor='form-name'>Полное имя</Label>
            <Input id='form-name' placeholder='Иван Иванов' />
          </div>
          <div>
            <Label htmlFor='form-email'>Email</Label>
            <Input id='form-email' type='email' placeholder='ivan@example.com' />
          </div>
          <div>
            <Label htmlFor='form-message'>Сообщение</Label>
            <Input id='form-message' placeholder='Ваше сообщение...' />
          </div>
          <Button className='w-full'>Отправить</Button>
        </div>
      </div>

      {/* Форма в две колонки */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Форма в две колонки</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='form-fname'>Имя</Label>
            <Input id='form-fname' placeholder='Имя' />
          </div>
          <div>
            <Label htmlFor='form-lname'>Фамилия</Label>
            <Input id='form-lname' placeholder='Фамилия' />
          </div>
          <div>
            <Label htmlFor='form-phone'>Телефон</Label>
            <Input id='form-phone' type='tel' placeholder='+7 (999) 123-45-67' />
          </div>
          <div>
            <Label htmlFor='form-company'>Компания</Label>
            <Input id='form-company' placeholder='Название компании' />
          </div>
          <div className='md:col-span-2'>
            <Label htmlFor='form-address'>Адрес</Label>
            <Input id='form-address' placeholder='Полный адрес' />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Файловые инпуты
export const FileInputs = {
  render: () => (
    <div className='space-y-4 max-w-md'>
      <div>
        <Label htmlFor='file-basic'>Загрузить файл</Label>
        <Input id='file-basic' type='file' />
      </div>

      <div>
        <Label htmlFor='file-multiple'>Несколько файлов</Label>
        <Input id='file-multiple' type='file' multiple />
      </div>

      <div>
        <Label htmlFor='file-images'>Только изображения</Label>
        <Input id='file-images' type='file' accept='image/*' />
      </div>

      <div>
        <Label htmlFor='file-docs'>Документы</Label>
        <Input id='file-docs' type='file' accept='.pdf,.doc,.docx' />
      </div>
    </div>
  ),
};
