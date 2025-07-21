import Breadcrumb from './Breadcrumb';

export default {
  title: 'Shared/UI/Breadcrumb',
  component: Breadcrumb,
};

export const Default = {
  args: {
    children: (
      <ol>
        <li>Home</li>
        <li>Library</li>
        <li>Data</li>
      </ol>
    ),
  },
};
