import { useState } from 'react';
import {
  CalendarDays, Settings, User, Calendar, Mail, Phone, MapPin, Clock,
} from 'lucide-react';

import Button from '../Button/Button';
import Input from '../Input/Input';
import Label from '../Label/Label';

import Popover from './Popover';
import PopoverContent from './PopoverContent';
import PopoverTrigger from './PopoverTrigger';

export default {
  title: 'Shared/UI/Popover',
  component: Popover,
};

// Базовый popover
export const Default = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Открыть Popover</Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Информация</h4>
            <p className='text-sm text-muted-foreground'>
              Это базовый пример Popover компонента. Здесь может быть любой контент.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// Popover с формой
export const WithForm = {
  render: () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Редактировать профиль</Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium leading-none'>Редактировать профиль</h4>
              <p className='text-sm text-muted-foreground'>
                Обновите информацию о своём профиле.
              </p>
            </div>
            <div className='grid gap-2'>
              <div className='grid grid-cols-3 items-center gap-4'>
                <Label htmlFor='name'>Имя</Label>
                <Input
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='col-span-2 h-8'
                  placeholder='Введите имя'
                />
              </div>
              <div className='grid grid-cols-3 items-center gap-4'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='col-span-2 h-8'
                  placeholder='example@email.com'
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' size='sm'>Отмена</Button>
              <Button size='sm'>Сохранить</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

// Информационные карточки
export const UserCard = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='h-auto p-2'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm'>
              ИИ
            </div>
            <span>Иван Иванов</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72' align='start'>
        <div className='grid gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white'>
              ИИ
            </div>
            <div>
              <h4 className='font-semibold'>Иван Иванов</h4>
              <p className='text-sm text-muted-foreground'>Senior Developer</p>
            </div>
          </div>
          <div className='grid gap-2 text-sm'>
            <div className='flex items-center gap-2'>
              <Mail className='w-4 h-4' />
              <span>ivan.ivanov@example.com</span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-4 h-4' />
              <span>+7 (999) 123-45-67</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4' />
              <span>Москва, Россия</span>
            </div>
          </div>
          <div className='flex gap-2 pt-2'>
            <Button size='sm' className='flex-1'>Написать</Button>
            <Button variant='outline' size='sm' className='flex-1'>Профиль</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// Календарь событий
export const EventPopover = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-fit'>
          <CalendarDays className='mr-2 h-4 w-4' />
          15 Янв, 2024
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>События на сегодня</h4>
          </div>
          <div className='grid gap-3'>
            <div className='flex items-center gap-3 p-3 border rounded-lg'>
              <div className='w-2 h-2 bg-blue-500 rounded-full' />
              <div className='flex-1'>
                <p className='font-medium text-sm'>Встреча с командой</p>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='w-3 h-3' />
                  <span>10:00 - 11:00</span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3 border rounded-lg'>
              <div className='w-2 h-2 bg-green-500 rounded-full' />
              <div className='flex-1'>
                <p className='font-medium text-sm'>Код ревью</p>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='w-3 h-3' />
                  <span>14:30 - 15:30</span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3 border rounded-lg'>
              <div className='w-2 h-2 bg-orange-500 rounded-full' />
              <div className='flex-1'>
                <p className='font-medium text-sm'>Презентация проекта</p>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='w-3 h-3' />
                  <span>16:00 - 17:00</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant='outline' size='sm' className='w-full'>
            <Calendar className='mr-2 h-4 w-4' />
            Открыть календарь
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// Различные выравнивания
export const Alignment = {
  render: () => (
    <div className='flex gap-4 justify-center'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Start</Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-56'>
          <p className='text-sm'>Popover выровнен по началу</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Center</Button>
        </PopoverTrigger>
        <PopoverContent align='center' className='w-56'>
          <p className='text-sm'>Popover выровнен по центру</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>End</Button>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-56'>
          <p className='text-sm'>Popover выровнен по концу</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

// Различные позиции
export const Positioning = {
  render: () => (
    <div className='grid grid-cols-3 gap-4 p-20'>
      <div />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Сверху</Button>
        </PopoverTrigger>
        <PopoverContent side='top' className='w-56'>
          <p className='text-sm'>Popover сверху</p>
        </PopoverContent>
      </Popover>
      <div />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Слева</Button>
        </PopoverTrigger>
        <PopoverContent side='left' className='w-56'>
          <p className='text-sm'>Popover слева</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Центр</Button>
        </PopoverTrigger>
        <PopoverContent className='w-56'>
          <p className='text-sm'>Popover снизу (по умолчанию)</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Справа</Button>
        </PopoverTrigger>
        <PopoverContent side='right' className='w-56'>
          <p className='text-sm'>Popover справа</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

// Контролируемый Popover
export const Controlled = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex gap-4 items-center'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant='outline'>
              {open ? 'Закрыть' : 'Открыть'} Popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56'>
            <div className='grid gap-4'>
              <p className='text-sm'>Этот Popover контролируется извне</p>
              <Button onClick={() => setOpen(false)} size='sm'>
                Закрыть изнутри
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant='ghost'
          onClick={() => setOpen(!open)}
        >
          Переключить программно
        </Button>
      </div>
    );
  },
};

// Различные триггеры
export const DifferentTriggers = {
  render: () => (
    <div className='flex gap-4 flex-wrap'>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Primary Button</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className='text-sm'>Triggered by primary button</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Outline Button</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className='text-sm'>Triggered by outline button</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <div className='cursor-pointer p-2 border border-dashed border-gray-300 rounded text-sm hover:border-gray-400'>
            Кликните на этот div
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <p className='text-sm'>Triggered by custom element</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='ghost' size='icon'>
            <Settings className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className='text-sm'>Triggered by icon button</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
