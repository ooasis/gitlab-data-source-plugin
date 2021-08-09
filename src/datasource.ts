// import defaults from 'lodash/defaults';

// @ts-ignore
import { getBackendSrv, logDebug, logInfo, logWarning, logError } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

const routePath = '/gitlab';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async query => {
      const frame = await this.doRequest(query);
      return frame;
    });
    const data = await Promise.all(promises);
    return { data };
  }

  async doRequest(query: MyQuery) {
    if (!query.group) {
      return await this.fetchGroups(query);
    } else if (!query.project) {
      return await this.fetchProjects(query);
    } else {
      return await this.fetchTags(query);
    }
  }

  async fetchTags(q: MyQuery) {
    const frame = new MutableDataFrame({
      refId: q.refId,
      fields: [
        { name: 'name', type: FieldType.string },
        { name: 'message', type: FieldType.string },
      ],
    });

    try {
      const { data: projects } = await this.callGitlabAPI(`/projects/${q.project}/repository/tags`);

      if (projects) {
        projects.forEach((r: any) => {
          frame.appendRow([r.name, r.message]);
        });
      }
    } catch (e) {
      logError(`Failed to fetch projects. Error: ${e}`);
    }

    return frame;
  }

  async fetchProjects(q: MyQuery) {
    const frame = new MutableDataFrame({
      refId: q.refId,
      fields: [
        { name: 'name', type: FieldType.string },
        { name: 'id', type: FieldType.number },
      ],
    });

    try {
      const { data: projects } = await this.callGitlabAPI(`/groups/${q.group}/projects`);

      if (projects) {
        projects.forEach((r: any) => {
          frame.appendRow([r.name, r.id]);
        });
      }
    } catch (e) {
      logError(`Failed to fetch projects. Error: ${e}`);
    }

    return frame;
  }

  async fetchGroups(q: MyQuery) {
    const frame = new MutableDataFrame({
      refId: q.refId,
      fields: [
        { name: 'name', type: FieldType.string },
        { name: 'id', type: FieldType.number },
      ],
    });

    try {
      const { data: groups } = await this.callGitlabAPI('/groups');

      if (groups) {
        groups.forEach((r: any) => {
          frame.appendRow([r.name, r.id]);
        });
      }
    } catch (e) {
      logError(`Failed to fetch groups. Error: ${e}`);
    }

    return frame;
  }

  async callGitlabAPI(path: string, params: any = {}) {
    const response = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: this.url + routePath + path,
      params,
    });
    logDebug(`Gitlab API response: ${response}`);
    return response;
  }

  async testDatasource() {
    try {
      await this.callGitlabAPI('/groups');
      return {
        status: 'success',
        message: 'Success',
      };
    } catch (e) {
      logError(`Failed to fetch groups. Error: ${e}`);
      return {
        status: 'error',
        message: `Error: ${e}`,
      };
    }
  }
}
