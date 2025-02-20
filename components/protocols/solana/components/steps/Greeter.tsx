import {Alert, Col, Input, Button, Space, Typography, Modal} from 'antd';
import {accountExplorer, transactionExplorer} from '@figment-solana/lib';
import {ErrorBox} from '@figment-solana/components/nav';
import {useState, useEffect} from 'react';
import type {ErrorT} from '@figment-solana/types';
import {prettyError} from '@figment-solana/lib';
import axios from 'axios';
import {
  getCurrentChainId,
  useGlobalState,
  getNetworkForCurrentChain,
  getChainInnerState,
  getCurrentStepIdForCurrentChain,
} from 'context';
import {PROTOCOL_INNER_STATES_ID} from 'types';

const {Text} = Typography;

const Greeter = () => {
  const {state, dispatch} = useGlobalState();
  const chainId = getCurrentChainId(state);
  const network = getNetworkForCurrentChain(state);
  const secret = getChainInnerState(
    state,
    chainId,
    PROTOCOL_INNER_STATES_ID.SECRET,
  );
  const programId = getChainInnerState(
    state,
    chainId,
    PROTOCOL_INNER_STATES_ID.CONTRACT_ID,
  );
  const greeter = getChainInnerState(
    state,
    chainId,
    PROTOCOL_INNER_STATES_ID.GREETER,
  );

  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<ErrorT | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      errorMsg(error);
    }
  }, [error, setError]);

  function errorMsg(error: ErrorT) {
    Modal.error({
      title: 'Unable to connect',
      content: <ErrorBox error={error} />,
      afterClose: () => setError(null),
      width: '800px',
    });
  }

  const setGreeterAccount = async () => {
    setError(null);
    setHash(null);
    setFetching(true);
    try {
      const response = await axios.post(`/api/solana/greeter`, {
        network,
        secret,
        programId,
      });
      setHash(response.data.hash);
      dispatch({
        type: 'SetStepInnerState',
        chainId,
        innerStateId: PROTOCOL_INNER_STATES_ID.GREETER,
        value: response.data.greeter,
      });
      dispatch({
        type: 'SetStepIsCompleted',
        chainId,
        stepId: getCurrentStepIdForCurrentChain(state),
        value: true,
      });
    } catch (error) {
      setError(prettyError(error));
    } finally {
      setFetching(false);
    }
  };

  if (greeter) {
    return (
      <Col>
        <Space direction="vertical">
          <Text>Greeter account created</Text>
          <Alert
            message={
              <a
                href={accountExplorer(greeter, network)}
                target="_blank"
                rel="noreferrer"
              >
                View the account on Solana Explorer
              </a>
            }
            type="success"
            showIcon
          />
          {hash && (
            <Alert
              message={
                <Text>
                  <a
                    href={transactionExplorer(hash, network)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View the transaction on Solana Explorer
                  </a>
                </Text>
              }
              type="warning"
              showIcon
            />
          )}
        </Space>
      </Col>
    );
  }

  return (
    <Col>
      <Space direction="vertical" size="large">
        <Space direction="vertical">
          <Text>
            We&apos;re going to derive the greeter account from the programId
          </Text>
          <Input
            placeholder={programId as string}
            disabled={true}
            style={{width: '500px'}}
          />
          <Button type="primary" onClick={setGreeterAccount} loading={fetching}>
            Create Greeter
          </Button>
        </Space>
      </Space>
    </Col>
  );
};

export default Greeter;
