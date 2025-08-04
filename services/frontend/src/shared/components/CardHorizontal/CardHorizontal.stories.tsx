import { Music } from 'lucide-react';

import CardHorizontal from './CardHorizontal';

export default {
  title: 'Shared/CardHorizontal',
  component: CardHorizontal,
};

export const Default = {
  render: () => {
    return (
      <CardHorizontal
        title='Заголовок'
        description='Описание'
        Icon={Music}
        iconBgColorClass='bg-green-100'
        iconTextColorClass='text-green-600'
      />
    );
  },
};
