import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { GitlabQuery, GitlabDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, GitlabQuery, GitlabDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
