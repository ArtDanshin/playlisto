import { useState } from 'react';
import {
  Home,
  Search,
  Settings,
  User,
  Users,
  Files,
  Calendar,
  Mail,
  Phone,
  Plus,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  BadgeCheck,
  Bell,
  Sparkles,
  CreditCard,
  PieChart,
  MoreHorizontal,
  Folder,
  Forward,
  Trash2,
  Archive,
  Reply,
  ReplyAll,
} from 'lucide-react';

import Button from '../Button/Button';
import Input from '../Input/Input';

import { SidebarProvider } from './SidebarProvider';
import Sidebar from './Sidebar';
import SidebarContent from './SidebarContent';
import SidebarFooter from './SidebarFooter';
import SidebarGroup from './SidebarGroup';
import SidebarGroupAction from './SidebarGroupAction';
import SidebarGroupContent from './SidebarGroupContent';
import SidebarGroupLabel from './SidebarGroupLabel';
import SidebarHeader from './SidebarHeader';
import SidebarInset from './SidebarInset';
import SidebarMenu from './SidebarMenu';
import SidebarMenuAction from './SidebarMenuAction';
import SidebarMenuBadge from './SidebarMenuBadge';
import SidebarMenuButton from './SidebarMenuButton';
import SidebarMenuItem from './SidebarMenuItem';
import SidebarMenuSub from './SidebarMenuSub';
import SidebarMenuSubButton from './SidebarMenuSubButton';
import SidebarMenuSubItem from './SidebarMenuSubItem';
import SidebarRail from './SidebarRail';
import SidebarSeparator from './SidebarSeparator';
import SidebarTrigger from './SidebarTrigger';

export default {
  title: 'Shared/UI/Sidebar',
  component: Sidebar,
};

// Базовый Sidebar
export const Default = {
  render: () => (
    <SidebarProvider>
      <div className='flex h-screen w-full'>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Home className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>Playlisto</span>
                    <span className='truncate text-xs'>Мой аккаунт</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Основное</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Home className='size-4' />
                    <span>Главная</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Search className='size-4' />
                    <span>Поиск</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Files className='size-4' />
                    <span>Плейлисты</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Личное</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <User className='size-4' />
                    <span>Профиль</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className='size-4' />
                    <span>Настройки</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LogOut className='size-4' />
                  <span>Выйти</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 px-4 border-b'>
            <SidebarTrigger className='-ml-1' />
            <h1 className='font-semibold'>Главная страница</h1>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            <div className='mx-auto w-full max-w-3xl'>
              <h2 className='text-2xl font-bold tracking-tight'>Добро пожаловать!</h2>
              <p className='text-muted-foreground'>
                Это главная страница приложения с боковой панелью.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
};

// Sidebar с sub-меню
export const WithSubMenus = {
  render: () => (
    <SidebarProvider>
      <div className='flex h-screen w-full'>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <PieChart className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>Dashboard</span>
                    <span className='truncate text-xs'>Enterprise</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Платформа</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Home className='size-4' />
                    <span>Главная</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <PieChart className='size-4' />
                    <span>Аналитика</span>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Users className='size-4' />
                    <span>Команды</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>Разработчики</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>Дизайнеры</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>Маркетинг</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Files className='size-4' />
                    <span>Проекты</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>Web App</span>
                        <SidebarMenuBadge>3</SidebarMenuBadge>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>Mobile App</span>
                        <SidebarMenuBadge>1</SidebarMenuBadge>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>API</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Инструменты</SidebarGroupLabel>
              <SidebarGroupAction>
                <Plus className='size-4' />
                <span className='sr-only'>Добавить инструмент</span>
              </SidebarGroupAction>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Calendar className='size-4' />
                    <span>Календарь</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Mail className='size-4' />
                    <span>Почта</span>
                    <SidebarMenuBadge>5</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User className='size-4' />
                  <span>Иван Иванов</span>
                  <ChevronsUpDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 px-4 border-b'>
            <SidebarTrigger className='-ml-1' />
            <h1 className='font-semibold'>Dashboard</h1>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
              <div className='aspect-video rounded-xl bg-muted/50' />
              <div className='aspect-video rounded-xl bg-muted/50' />
              <div className='aspect-video rounded-xl bg-muted/50' />
            </div>
            <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
};

// Разные варианты Sidebar
export const Variants = {
  render: () => {
    const [variant, setVariant] = useState<'sidebar' | 'floating' | 'inset'>('sidebar');

    return (
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Button
            variant={variant === 'sidebar' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setVariant('sidebar')}
          >
            Sidebar
          </Button>
          <Button
            variant={variant === 'floating' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setVariant('floating')}
          >
            Floating
          </Button>
          <Button
            variant={variant === 'inset' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setVariant('inset')}
          >
            Inset
          </Button>
        </div>

        <SidebarProvider>
          <div className='flex h-[600px] w-full border rounded-lg overflow-hidden'>
            <Sidebar variant={variant} side='left'>
              <SidebarHeader>
                <h3 className='px-2 text-lg font-semibold'>Variant: {variant}</h3>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Home className='size-4' />
                        <span>Главная</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Search className='size-4' />
                        <span>Поиск</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Settings className='size-4' />
                        <span>Настройки</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <header className='flex h-16 shrink-0 items-center gap-2 px-4 border-b'>
                <SidebarTrigger className='-ml-1' />
                <h1 className='font-semibold'>Контент</h1>
              </header>
              <div className='flex flex-1 items-center justify-center'>
                <p className='text-muted-foreground'>
                  Вариант: <strong>{variant}</strong>
                </p>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  },
};

// Sidebar с действиями в меню
export const WithMenuActions = {
  render: () => (
    <SidebarProvider>
      <div className='flex h-screen w-full'>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Mail className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>Mail App</span>
                    <span className='truncate text-xs'>Inbox</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <SidebarGroupAction>
                <Plus className='size-4' />
                <span className='sr-only'>Добавить папку</span>
              </SidebarGroupAction>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Mail className='size-4' />
                    <span>Входящие</span>
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  </SidebarMenuButton>
                  <SidebarMenuAction>
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>Больше действий</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Reply className='size-4' />
                    <span>Отправленные</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction>
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>Больше действий</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Archive className='size-4' />
                    <span>Архив</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction>
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>Больше действий</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Trash2 className='size-4' />
                    <span>Корзина</span>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuButton>
                  <SidebarMenuAction>
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>Больше действий</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Labels</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <div className='size-2 rounded-full bg-red-500' />
                    <span>Важное</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <div className='size-2 rounded-full bg-blue-500' />
                    <span>Работа</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <div className='size-2 rounded-full bg-green-500' />
                    <span>Личное</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User className='size-4' />
                  <span>user@example.com</span>
                  <ChevronsUpDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 px-4 border-b'>
            <SidebarTrigger className='-ml-1' />
            <h1 className='font-semibold'>Почта</h1>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            <div className='grid gap-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>Входящие</h2>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    <Reply className='size-4 mr-2' />
                    Ответить
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Forward className='size-4 mr-2' />
                    Переслать
                  </Button>
                </div>
              </div>
              <div className='space-y-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-4 p-3 border rounded-lg'>
                    <div className='size-2 rounded-full bg-blue-500' />
                    <div className='flex-1'>
                      <p className='font-medium'>Тема письма {i + 1}</p>
                      <p className='text-sm text-muted-foreground'>
                        Краткий превью текста письма...
                      </p>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      2 ч назад
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
        <SidebarRail />
      </div>
    </SidebarProvider>
  ),
};

// Компактный режим
export const Collapsible = {
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <div className='flex h-screen w-full'>
        <Sidebar collapsible='icon'>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg' tooltip='Playlisto'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Home className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>Playlisto</span>
                    <span className='truncate text-xs'>v2.0</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Основное</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip='Главная'>
                    <Home className='size-4' />
                    <span>Главная</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip='Поиск'>
                    <Search className='size-4' />
                    <span>Поиск</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip='Плейлисты'>
                    <Files className='size-4' />
                    <span>Плейлисты</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip='Настройки'>
                    <Settings className='size-4' />
                    <span>Настройки</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip='Профиль'>
                  <User className='size-4' />
                  <span>Профиль</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 px-4 border-b'>
            <SidebarTrigger className='-ml-1' />
            <h1 className='font-semibold'>Сворачиваемый Sidebar</h1>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            <div className='mx-auto w-full max-w-3xl'>
              <h2 className='text-2xl font-bold tracking-tight'>Компактный режим</h2>
              <p className='text-muted-foreground'>
                В этом режиме sidebar автоматически сворачивается до иконок.
                Наведите на иконки, чтобы увидеть подсказки.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
};
