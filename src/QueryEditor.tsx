import { QueryEditorProps } from '@grafana/data';
import { Button, LegacyForms } from '@grafana/ui';
import React, { ChangeEvent, PureComponent } from 'react';
import { DataSource } from './datasource';
import { GitlabDataSourceOptions, GitlabQuery } from './types';


const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, GitlabQuery, GitlabDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onGroupChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const newVal = event.target.value;
    onChange({ ...query, groupId: newVal ? parseInt(newVal, 10) : undefined });
  };

  onProjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const newVal = event.target.value;
    onChange({ ...query, projectId: newVal ? parseInt(newVal, 10) : undefined });
  };

  onExecute = () => {
    const { onRunQuery } = this.props;
    onRunQuery();
  };

  render() {
    const { groupId: group, projectId: project } = this.props.query;

    return (
      <div className="gf-form">
        <FormField width={8} value={group} onChange={this.onGroupChange} label="Group" type="number" step="1" />
        <FormField width={8} value={project} onChange={this.onProjectChange} label="Project" type="number" step="1" />
        <Button onClick={this.onExecute}>Execute</Button>
      </div>
    );
  }
}
