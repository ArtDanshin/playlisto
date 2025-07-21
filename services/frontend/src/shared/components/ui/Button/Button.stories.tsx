import Button from './Button';

export default {
  title: 'Shared/UI/Button',
  component: Button,
};

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