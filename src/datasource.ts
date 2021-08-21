import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { GitlabDataSourceOptions, GitlabQuery } from './types';

const routePath = '/gitlab';

export class DataSource extends DataSourceApi<GitlabQuery, GitlabDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<GitlabDataSourceOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<GitlabQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(async (query) => {
      const frame = await this.doRequest(query);
      return frame;
    });
    const data = await Promise.all(promises);
    return { data };
  }

  async doRequest(query: GitlabQuery) {
    if (!query.groupId) {
      return await this.fetchGroups(query);
    } else if (!query.projectId) {
      return await this.fetchProjects(query);
    } else {
      return await this.fetchTags(query);
    }
  }

  async fetchTags(q: GitlabQuery) {
    const frame = new MutableDataFrame({
      refId: q.refId,
      fields: [
        { name: 'name', type: FieldType.string },
        { name: 'message', type: FieldType.string },
      ],
    });

    const { data: projects } = await this.callGitlabAPI(`/projects/${q.projectId}/repository/tags`);
    if (projects) {
      projects.forEach((r: any) => {
        frame.appendRow([r.name, r.message]);
      });
    }

    return frame;
  }

  async fetchProjects(q: GitlabQuery) {
    const frame = new MutableDataFrame({
      refId: q.refId,
      fields: [
        { name: 'name', type: FieldType.string },
        { name: 'id', type: FieldType.number },
      ],
    });

    const { data: projects } = await this.callGitlabAPI(`/groups/${q.groupId}/projects`);
    if (projects) {
      projects.forEach((r: any) => {
        frame.appendRow([r.name, r.id]);
      });
    }

    return frame;
  }

  async fetchGroups(q: GitlabQuery) {
    const frame = new MutableDataFrame({
      refId: q.refId,
      fields: [
        { name: 'name', type: FieldType.string },
        { name: 'id', type: FieldType.number },
      ],
    });

    const { data: groups } = await this.callGitlabAPI('/groups');
    if (groups) {
      groups.forEach((r: any) => {
        frame.appendRow([r.name, r.id]);
      });
    }

    return frame;
  }

  async callGitlabAPI(path: string, params: object = {}) {
    try {
      const response = await getBackendSrv().datasourceRequest({
        method: 'GET',
        url: this.url + routePath + path,
        params: { ...params, per_page: 100 },
      });
      console.debug(`Gitlab API response: ${response}`);
      return response;
    } catch (e) {
      console.error(`Failed to fetch groups. Error: ${e}`);
      throw e;
    }
  }

  async testDatasource() {
    try {
      await this.callGitlabAPI('/groups');
      return {
        status: 'success',
        message: 'Success',
      };
    } catch (e) {
      return {
        status: 'error',
        message: `Error: ${e}`,
      };
    }
  }
}
