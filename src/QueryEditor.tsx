import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { Button, LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onGroupChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const newVal = event.target.value;
    onChange({ ...query, group: newVal ? parseInt(newVal, 10) : undefined });
  };

  onProjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const newVal = event.target.value;
    onChange({ ...query, project: newVal ? parseInt(newVal, 10) : undefined });
  };

  onExecute = () => {
    const { onRunQuery } = this.props;
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { group, project } = query;

    return (
      <div className="gf-form">
        <FormField width={8} value={group} onChange={this.onGroupChange} label="Group Id" type="number" step="1" />
        <FormField
          width={8}
          value={project}
          onChange={this.onProjectChange}
          label="Project Id"
          type="number"
          step="1"
        />
        <Button onClick={this.onExecute}>Execute</Button>
      </div>
    );
  }
}
