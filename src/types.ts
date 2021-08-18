import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface GitlabQuery extends DataQuery {
  groupId?: number;
  projectId?: number;
}

/**
 * These are options configured for each DataSource instance
 */
export interface GitlabDataSourceOptions extends DataSourceJsonData {
  apiEndpoint: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface GitlabSecureJsonData {
  apiKey: string;
}
