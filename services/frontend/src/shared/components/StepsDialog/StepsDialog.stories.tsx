import { CheckCircle, Music } from 'lucide-react';

import { Button } from '../ui/Button';

import StepsDialog, { type Step } from './StepsDialog';

export default {
  title: 'Shared/StepsDialog',
  component: StepsDialog,
};

// Базовый popover
export const Default = {
  render: () => {
    const stepOne: Step = {
      component: (next) => (
        <div className='space-y-6'>
          <div className='text-center'>
            <Music className='h-12 w-12 text-blue-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Выберите источник данных</h3>
            <p className='text-muted-foreground'>
              Выберите, какую информацию хотите добавить к трекам плейлиста
            </p>
          </div>

          <div className='grid gap-4'>
            <div
              className='cursor-pointer hover:bg-muted/50 transition-colors border rounded-lg p-6'
              onClick={() => next()}
            >
              <div className='mb-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2 mb-2'>
                  <Music className='h-5 w-5' />
                  Распознать
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Найти точные совпадения треков и связать их
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Треки будут найдены по артисту и названию. Если найдено точное совпадение, трек будет связан.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    };

    const stepTwo: Step = {
      component: () => (
        <div className='space-y-4'>
          <div className='text-center'>
            <Music className='h-12 w-12 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Начинаем распознавание</h3>
            <p className='text-muted-foreground'>
              Ищем точные совпадения треков
            </p>
          </div>
        </div>
      ),
      viewPrevButton: { status: 'active' },
      viewNextButton: { status: 'active' },
    };

    const finalStep: Step = {
      component: () => (
        <div className='space-y-4'>
          <div className='text-center'>
            <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Распознавание завершено</h3>
            <p className='text-muted-foreground'>Распознано 1 из 100500 треков</p>
          </div>
        </div>
      ),
      viewPrevButton: { status: 'active' },
      viewCloseButton: { status: 'active' },
    };

    return (
      <StepsDialog
        title='Заголовок'
        description='Описание'
        trigger={(
          <Button
            onClick={() => {}}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Music className='h-4 w-4' />
            Открыть пошаговый диалог
          </Button>
        )}
        steps={[stepOne, stepTwo, finalStep]}
      />
    );
  },
};
