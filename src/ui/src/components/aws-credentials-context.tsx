import React, { FC, useContext, useState } from 'react';
import { Credentials } from '@aws-sdk/types';
import { Box, Button, FormField, Header, Input, Modal, SpaceBetween } from '@awsui/components-react';
import { useInput, useLocalStorage } from '@/utils/hooks';

import './aws-credentials-context.scss';

export interface AwsConfiguration {
  region?: string;
  credentials?: Credentials;
}

export interface UseAwsConfiguration {
  configuration: AwsConfiguration;
  setModalVisible: (visible: boolean) => void;
}

const AwsCredentialsContext = React.createContext<UseAwsConfiguration | undefined>(undefined);

/**
 * Context provider that provides AWS credentials context and allows sub-components to open the credentials modal.
 */
export const AwsCredentialsProvider: FC = ({ children }) => {
  const [configuration, setConfiguration] = useLocalStorage<AwsConfiguration>('aws.configuration', {});
  const [isModalVisible, setModalVisible] = useState(false);

  const awsRegionInputProps = useInput(configuration?.region);
  const awsAccessKeyIdInputProps = useInput(configuration?.credentials?.accessKeyId);
  const awsSecretAccessKeyInputProps = useInput(configuration?.credentials?.secretAccessKey);
  const awsSessionTokenInputProps = useInput(configuration?.credentials?.sessionToken);

  const handleSubmit = () => {
    // TODO Validate credentials
    setConfiguration({
      region: awsRegionInputProps.value,
      credentials: {
        accessKeyId: awsAccessKeyIdInputProps.value,
        secretAccessKey: awsSecretAccessKeyInputProps.value,
        sessionToken: awsSessionTokenInputProps.value,
      },
    });
    setModalVisible(false);
  };

  const handleDismiss = () => {
    setModalVisible(false);
  };

  return (
    <AwsCredentialsContext.Provider value={{ configuration, setModalVisible }}>
      {children}
      <Modal
        className="aws-credentials-modal"
        visible={isModalVisible}
        onDismiss={handleDismiss}
        header={<Header variant="h3">Configure Credentials</Header>}
        footer={
          <Box float="right">
            <Button variant="link" onClick={handleDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Box>
        }
      >
        <SpaceBetween direction="vertical" size="s">
          <FormField label="AWS Region">
            <Input {...awsRegionInputProps} />
          </FormField>
          <FormField label="AWS Access Key ID">
            <Input {...awsAccessKeyIdInputProps} type="password" />
          </FormField>
          <FormField label="AWS Secret Access Key">
            <Input {...awsSecretAccessKeyInputProps} type="password" />
          </FormField>
          <FormField label="AWS Session Token">
            <Input {...awsSessionTokenInputProps} type="password" />
          </FormField>
        </SpaceBetween>
      </Modal>
    </AwsCredentialsContext.Provider>
  );
};

export function useAwsConfiguration(): UseAwsConfiguration {
  return useContext(AwsCredentialsContext)!;
}
