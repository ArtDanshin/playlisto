import Separator from './Separator';

export default {
  title: 'Shared/UI/Separator',
  component: Separator,
};

export const Horizontal = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical = {
  args: {
    orientation: 'vertical',
    style: { height: 50 },
  },
};
