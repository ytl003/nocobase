import { ISchema } from '@formily/react';
import { AntdChart } from './antd';
import { Statistic as AntdStatistic } from 'antd';
import { lang } from '../../locale';
import { FieldOption } from '../../hooks';
import { QueryProps } from '../../renderer';
import { RenderProps } from '../chart';

export class Statistic extends AntdChart {
  constructor() {
    super({
      name: 'statistic',
      title: 'Statistic',
      component: AntdStatistic,
      config: [
        {
          property: 'field',
          name: 'field',
          title: 'Field',
          required: true,
        },
        {
          title: {
            title: lang('Title'),
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
        },
      ],
    });
  }

  init(
    fields: FieldOption[],
    {
      measures,
      dimensions,
    }: {
      measures?: QueryProps['measures'];
      dimensions?: QueryProps['dimensions'];
    },
  ) {
    const { yField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        field: yField?.value,
        title: yField?.label,
      },
    };
  }

  getProps({ data, fieldProps, general, advanced }: RenderProps) {
    const record = data[0] || {};
    const field = general?.field;
    const props = fieldProps[field];
    return {
      value: record[field],
      formatter: props?.transformer,
      ...general,
      ...advanced,
    };
  }
}
