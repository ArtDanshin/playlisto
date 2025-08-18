import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './index';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Button Component

Общий компонент кнопки с поддержкой навигации через React Router.

## Особенности

- Обертка над \`@/shared/components/ui/Button\`
- Поддержка навигации через React Router
- Все пропсы базового компонента Button поддерживаются
- Типизация TypeScript

## Пропсы

### \`to?: string\`
Маршрут для навигации. Если указан, при клике на кнопку произойдет переход по указанному маршруту.

### \`onClick?: (event: MouseEvent<HTMLButtonElement>) => void\`
Дополнительный обработчик клика. Выполняется после навигации (если указан \`to\`).

### Остальные пропсы
Все пропсы базового компонента \`@/shared/components/ui/Button\` поддерживаются и пробрасываются без изменений.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    to: {
      description: 'Маршрут для навигации через React Router',
      control: 'text',
    },
    variant: {
      description: 'Вариант стиля кнопки',
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      description: 'Размер кнопки',
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      description: 'Отключена ли кнопка',
      control: 'boolean',
    },
    onClick: {
      description: 'Дополнительный обработчик клика',
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Обычная кнопка',
  },
};

export const WithNavigation: Story = {
  args: {
    to: '/settings',
    children: 'Перейти к настройкам',
  },
  parameters: {
    docs: {
      description: {
        story: 'Кнопка с навигацией. При клике произойдет переход по указанному маршруту.',
      },
    },
  },
};

export const WithNavigationAndClick: Story = {
  args: {
    to: '/settings',
    onClick: () => console.log('Navigating to settings'),
    children: 'Настройки с обработчиком',
  },
  parameters: {
    docs: {
      description: {
        story: 'Кнопка с навигацией и дополнительным обработчиком. Сначала выполняется навигация, затем обработчик.',
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline кнопка',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Маленькая кнопка',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Большая кнопка',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost кнопка',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Отключенная кнопка',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Удалить',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'outline',
    size: 'sm',
    children: (
      <>
        <svg
          className='mr-2 h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
        Добавить
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Кнопка с иконкой. Поддерживает любые React элементы в качестве children.',
      },
    },
  },
};

export const NavigationToPlaylist: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    to: '/playlist/123',
    children: 'Мой плейлист',
  },
  parameters: {
    docs: {
      description: {
        story: 'Пример навигации к плейлисту с динамическим ID.',
      },
    },
  },
};

export const BackButton: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    to: '/',
    children: (
      <>
        <svg
          className='mr-2 h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10 19l-7-7m0 0l7-7m-7 7h18'
          />
        </svg>
        Назад
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Пример кнопки "Назад" с иконкой стрелки.',
      },
    },
  },
};
