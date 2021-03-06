import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { LegacyForms } from '@grafana/ui';
import React, { ChangeEvent, PureComponent } from 'react';
import { GitlabDataSourceOptions, GitlabSecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<GitlabDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onEndpointChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      apiEndpoint: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };

  onAPIKeyReset = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as GitlabSecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            value={jsonData.apiEndpoint || ''}
            label="API Endpoint"
            placeholder="api endpoint"
            labelWidth={10}
            inputWidth={20}
            onChange={this.onEndpointChange}
          />
        </div>

        <div>
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.apiKey) as boolean}
              value={secureJsonData.apiKey || ''}
              label="Private Token"
              placeholder="private token"
              labelWidth={10}
              inputWidth={20}
              onReset={this.onAPIKeyReset}
              onChange={this.onAPIKeyChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
