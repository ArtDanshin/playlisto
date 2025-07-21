import ScrollArea from './ScrollArea';

export default {
  title: 'Shared/UI/ScrollArea',
  component: ScrollArea,
};

export const Default = {
  args: {
    children: (
      <div style={{ height: 200 }}>
        <div style={{ height: 400 }}>
          Scrollable content
        </div>
      </div>
    ),
  },
};
