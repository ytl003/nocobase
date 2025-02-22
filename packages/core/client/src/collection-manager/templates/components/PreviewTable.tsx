import { RecursionField, useForm } from '@formily/react';
import { Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EllipsisWithTooltip, useCompile } from '../../../';
import { useAPIClient } from '../../../api-client';
import { useCollectionManager } from '../../hooks/useCollectionManager';

export const PreviewTable = (props) => {
  const { databaseView, schema, viewName, fields } = props;
  const [previewColumns, setPreviewColumns] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const compile = useCompile();
  const [loading, setLoading] = useState(false);
  const { getInterface, getCollectionFields } = useCollectionManager();
  const api = useAPIClient();
  const { t } = useTranslation();
  const form = useForm();
  useEffect(() => {
    if (databaseView) {
      getPreviewData();
    }
  }, [databaseView]);

  useEffect(() => {
    const pColumns = formatPreviewColumns(fields);
    setPreviewColumns(pColumns);
  }, [form.values.fields]);

  const getPreviewData = () => {
    setLoading(true);
    api
      .resource(`dbViews`)
      .query({ filterByTk: viewName, schema })
      .then(({ data }) => {
        if (data) {
          setLoading(false);
          setPreviewData(data?.data || []);
        }
      }).catch;
  };

  const formatPreviewColumns = (data) => {
    return data
      .filter((k) => k.source || k.interface)
      ?.map((item) => {
        const fieldSource = typeof item?.source === 'string' ? item?.source?.split('.') : item?.source;
        const sourceField = getCollectionFields(fieldSource?.[0])?.find((v) => v.name === fieldSource?.[1])?.uiSchema;
        const target = item?.uiSchema?.title || sourceField?.title || item.name;
        const schema: any = item.source ? sourceField : getInterface(item.interface)?.default?.uiSchema;
        return {
          title: compile(target),
          dataIndex: item.name,
          key: item.name,
          width: 200,
          render: (v, record, index) => {
            const content = record[item.name];
            const objSchema: any = {
              type: 'object',
              properties: {
                [item.name]: { ...schema, default: content, 'x-read-pretty': true, title: null },
              },
            };
            return (
              <EllipsisWithTooltip ellipsis={true}>
                <RecursionField schema={objSchema} name={index} onlyRenderProperties />
              </EllipsisWithTooltip>
            );
          },
        };
      });
  };
  return (
    <Spin spinning={loading}>
      <div
        style={{
          marginBottom: 22,
        }}
      >
        {previewColumns?.length > 0 && [
          <div
            className="ant-formily-item-label"
            style={{ marginTop: 24, display: 'flex', padding: '0 0 8px' }}
            key={viewName}
          >
            <div className="ant-formily-item-label-content">
              <span>
                <label>{t('Preview')}</label>
              </span>
            </div>
            <span className="ant-formily-item-colon">:</span>
          </div>,
          <Table
            size={'middle'}
            pagination={false}
            bordered
            columns={previewColumns}
            dataSource={previewData}
            scroll={{ x: 1000, y: 300 }}
            key={viewName}
          />,
        ]}
      </div>
    </Spin>
  );
};
