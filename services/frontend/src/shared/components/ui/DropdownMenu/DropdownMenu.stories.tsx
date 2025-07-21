import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Circle,
  CreditCard,
  Github,
  Keyboard,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from 'lucide-react';

import Button from '../Button/Button';

import DropdownMenu from './DropdownMenu';
import DropdownMenuContent from './DropdownMenuContent';
import DropdownMenuGroup from './DropdownMenuGroup';
import DropdownMenuLabel from './DropdownMenuLabel';
import DropdownMenuItem from './DropdownMenuItem';
import DropdownMenuCheckboxItem from './DropdownMenuCheckboxItem';
import DropdownMenuRadioGroup from './DropdownMenuRadioGroup';
import DropdownMenuRadioItem from './DropdownMenuRadioItem';
import DropdownMenuSeparator from './DropdownMenuSeparator';
import DropdownMenuShortcut from './DropdownMenuShortcut';
import DropdownMenuSub from './DropdownMenuSub';
import DropdownMenuSubTrigger from './DropdownMenuSubTrigger';
import DropdownMenuSubContent from './DropdownMenuSubContent';
import DropdownMenuTrigger from './DropdownMenuTrigger';

export default {
  title: 'Shared/UI/DropdownMenu',
  component: DropdownMenu,
};

// Базовый dropdown menu
export const Default = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Открыть меню</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className='mr-2 h-4 w-4' />
            <span>Профиль</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className='mr-2 h-4 w-4' />
            <span>Платёжные данные</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className='mr-2 h-4 w-4' />
            <span>Настройки</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className='mr-2 h-4 w-4' />
            <span>Горячие клавиши</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Выйти</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Dropdown с checkbox элементами
export const WithCheckboxes = {
  render: () => {
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [showActivityBar, setShowActivityBar] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Настройки вида</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuLabel>Панели</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showStatusBar}
            onCheckedChange={setShowStatusBar}
          >
            Строка состояния
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
            disabled
          >
            Панель активности
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Панель
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

// Dropdown с radio группой
export const WithRadioGroup = {
  render: () => {
    const [position, setPosition] = useState('bottom');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Позиция панели</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuLabel>Панель</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value='top'>Сверху</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='bottom'>Снизу</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='right'>Справа</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

// Dropdown с sub-меню
export const WithSubMenu = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Управление командой</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Команда</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className='mr-2 h-4 w-4' />
            <span>Профиль</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className='mr-2 h-4 w-4' />
            <span>Платёжные данные</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPlus className='mr-2 h-4 w-4' />
              <span>Пригласить пользователей</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                <Mail className='mr-2 h-4 w-4' />
                <span>Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className='mr-2 h-4 w-4' />
                <span>Сообщение</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <PlusCircle className='mr-2 h-4 w-4' />
                <span>Больше...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Plus className='mr-2 h-4 w-4' />
            <span>Новая команда</span>
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Github className='mr-2 h-4 w-4' />
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Circle className='mr-2 h-4 w-4' />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Выйти</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Компактное меню
export const Compact = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm'>
          •••
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem>Редактировать</DropdownMenuItem>
        <DropdownMenuItem>Дублировать</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-red-600'>
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Различные варианты триггеров
export const DifferentTriggers = {
  render: () => (
    <div className='flex gap-4 flex-wrap'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Primary Trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Опция 1</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Outline Trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Опция 1</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost'>Ghost Trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Опция 1</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' size='sm'>
            Small
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Опция 1</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

// Различные размеры и выравнивания
export const Alignment = {
  render: () => (
    <div className='flex gap-4'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Start</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem>Выровнено по началу</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
          <DropdownMenuItem>Опция 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Center</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='center'>
          <DropdownMenuItem>Выровнено по центру</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
          <DropdownMenuItem>Опция 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>End</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>Выровнено по концу</DropdownMenuItem>
          <DropdownMenuItem>Опция 2</DropdownMenuItem>
          <DropdownMenuItem>Опция 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
