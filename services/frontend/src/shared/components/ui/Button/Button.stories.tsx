import {
  Mail,
  Download,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  Settings,
  Heart,
  Star,
  Search,
  ChevronDown,
} from 'lucide-react';

import Button from './Button';

export default {
  title: 'Shared/UI/Button',
  component: Button,
};

// Все варианты кнопок
export const Variants = {
  render: () => (
    <div className='grid grid-cols-3 gap-4'>
      <Button variant='default'>Default</Button>
      <Button variant='destructive'>Destructive</Button>
      <Button variant='outline'>Outline</Button>
      <Button variant='secondary'>Secondary</Button>
      <Button variant='ghost'>Ghost</Button>
      <Button variant='link'>Link</Button>
    </div>
  ),
};

// Все размеры
export const Sizes = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Button size='sm'>Small</Button>
      <Button size='default'>Default</Button>
      <Button size='lg'>Large</Button>
      <Button size='icon'>
        <Settings className='h-4 w-4' />
      </Button>
    </div>
  ),
};

// Кнопки с иконками
export const WithIcons = {
  render: () => (
    <div className='grid grid-cols-2 gap-4'>
      <Button>
        <Mail className='mr-2 h-4 w-4' />
        Отправить письмо
      </Button>
      <Button variant='outline'>
        <Download className='mr-2 h-4 w-4' />
        Скачать
      </Button>
      <Button variant='secondary'>
        Подробнее
        <ArrowRight className='ml-2 h-4 w-4' />
      </Button>
      <Button variant='destructive'>
        <Trash2 className='mr-2 h-4 w-4' />
        Удалить
      </Button>
    </div>
  ),
};

// Иконка-кнопки
export const IconButtons = {
  render: () => (
    <div className='flex gap-2'>
      <Button variant='outline' size='icon'>
        <Heart className='h-4 w-4' />
      </Button>
      <Button variant='outline' size='icon'>
        <Star className='h-4 w-4' />
      </Button>
      <Button variant='outline' size='icon'>
        <Search className='h-4 w-4' />
      </Button>
      <Button variant='outline' size='icon'>
        <Settings className='h-4 w-4' />
      </Button>
      <Button variant='destructive' size='icon'>
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  ),
};

// Состояния кнопок
export const States = {
  render: () => (
    <div className='grid grid-cols-2 gap-4'>
      <Button>Обычная</Button>
      <Button disabled>Отключена</Button>
      <Button>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        Загрузка...
      </Button>
      <Button variant='outline' disabled>
        <Mail className='mr-2 h-4 w-4' />
        Недоступно
      </Button>
    </div>
  ),
};

// Как ссылки (asChild)
export const AsChild = {
  render: () => (
    <div className='flex gap-4'>
      <Button asChild>
        <a href='#' target='_blank' rel='noopener noreferrer'>
          Открыть в новой вкладке
        </a>
      </Button>
      <Button variant='outline' asChild>
        <a href='mailto:example@email.com'>
          <Mail className='mr-2 h-4 w-4' />
          Написать письмо
        </a>
      </Button>
    </div>
  ),
};

// Группы кнопок
export const ButtonGroups = {
  render: () => (
    <div className='space-y-4'>
      <div className='flex'>
        <Button variant='outline' className='rounded-r-none border-r-0'>
          Левая
        </Button>
        <Button variant='outline' className='rounded-none border-r-0'>
          Центр
        </Button>
        <Button variant='outline' className='rounded-l-none'>
          Правая
        </Button>
      </div>

      <div className='flex gap-1'>
        <Button size='sm'>Сохранить</Button>
        <Button variant='outline' size='sm'>Отмена</Button>
      </div>

      <div className='flex gap-2'>
        <Button>
          Основное действие
        </Button>
        <Button variant='outline'>
          <ChevronDown className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  ),
};

// Примеры использования
export const UseCases = {
  render: () => (
    <div className='space-y-6'>
      {/* Форма */}
      <div className='space-y-3'>
        <h3 className='text-lg font-semibold'>Форма</h3>
        <div className='flex gap-2'>
          <Button>Сохранить</Button>
          <Button variant='outline'>Отмена</Button>
          <Button variant='destructive'>Сброс</Button>
        </div>
      </div>

      {/* Карточка товара */}
      <div className='space-y-3'>
        <h3 className='text-lg font-semibold'>Карточка товара</h3>
        <div className='flex gap-2'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            В корзину
          </Button>
          <Button variant='outline' size='icon'>
            <Heart className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='sm'>
            Сравнить
          </Button>
        </div>
      </div>

      {/* Навигация */}
      <div className='space-y-3'>
        <h3 className='text-lg font-semibold'>Навигация</h3>
        <div className='flex gap-2'>
          <Button variant='ghost'>Главная</Button>
          <Button variant='ghost'>О нас</Button>
          <Button variant='ghost'>Контакты</Button>
          <Button>Войти</Button>
        </div>
      </div>

      {/* Действия с файлом */}
      <div className='space-y-3'>
        <h3 className='text-lg font-semibold'>Действия с файлом</h3>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Скачать
          </Button>
          <Button variant='outline' size='sm'>
            <Settings className='mr-2 h-4 w-4' />
            Настройки
          </Button>
          <Button variant='destructive' size='sm'>
            <Trash2 className='mr-2 h-4 w-4' />
            Удалить
          </Button>
        </div>
      </div>
    </div>
  ),
};

// Адаптивность
export const Responsive = {
  render: () => (
    <div className='space-y-4'>
      <Button className='w-full sm:w-auto'>
        Адаптивная кнопка
      </Button>
      <div className='flex flex-col sm:flex-row gap-2'>
        <Button className='flex-1'>Действие 1</Button>
        <Button variant='outline' className='flex-1'>Действие 2</Button>
      </div>
    </div>
  ),
};

// Исходные простые примеры (для совместимости)
export const Primary = {
  args: {
    children: 'Primary Button',
  },
};

export const Disabled = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
