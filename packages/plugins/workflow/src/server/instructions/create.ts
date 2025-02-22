import { JOB_STATUS } from '../constants';
import { toJSON } from '../utils';
import type { FlowNodeModel } from '../types';

export default {
  async run(node: FlowNodeModel, input, processor) {
    const { collection, params: { appends = [], ...params } = {} } = node.config;

    const { repository, model } = (<typeof FlowNodeModel>node.constructor).database.getCollection(collection);
    const options = processor.getParsedValue(params, node);
    const created = await repository.create({
      ...options,
      context: {
        executionId: processor.execution.id,
      },
      transaction: processor.transaction,
    });

    let result = created;
    if (created && appends.length) {
      const includeFields = appends.reduce((set, field) => {
        set.add(field.split('.')[0]);
        set.add(field);
        return set;
      }, new Set());
      result = await repository.findOne({
        filterByTk: created[model.primaryKeyAttribute],
        appends: Array.from(includeFields),
        transaction: processor.transaction,
      });
    }

    return {
      // NOTE: get() for non-proxied instance (#380)
      result: toJSON(result),
      status: JOB_STATUS.RESOLVED,
    };
  },
};
