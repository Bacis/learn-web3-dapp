import {Alert, Button, Col, Space, Typography} from 'antd';
import {useEffect, useState} from 'react';
import axios from 'axios';
import {
  getCurrentChainId,
  useGlobalState,
  getCurrentStepIdForCurrentChain,
} from 'context';
import {PROTOCOL_INNER_STATES_ID} from 'types';
import {getAvalancheInnerState} from '@figment-avalanche/lib';

const {Text} = Typography;

const Account = () => {
  const {state, dispatch} = useGlobalState();
  const avalancheState = getAvalancheInnerState(state);
  const [address, setAddress] = useState<string | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      dispatch({
        type: 'SetStepIsCompleted',
        chainId: getCurrentChainId(state),
        stepId: getCurrentStepIdForCurrentChain(state),
        value: true,
      });
    }
  }, [address, setAddress]);

  useEffect(() => {
    if (avalancheState.address) {
      setAddress(avalancheState.address);
    }
  }, []);

  const generateKeypair = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`/api/avalanche/account`);
      setAddress(response.data.address);
      setFetching(false);
      dispatch({
        type: 'SetStepInnerState',
        chainId: getCurrentChainId(state),
        innerStateId: PROTOCOL_INNER_STATES_ID.SECRET,
        value: response.data.secret,
      });
      dispatch({
        type: 'SetStepInnerState',
        chainId: getCurrentChainId(state),
        innerStateId: PROTOCOL_INNER_STATES_ID.ADDRESS,
        value: response.data.address,
      });
      dispatch({
        type: 'SetStepIsCompleted',
        chainId: getCurrentChainId(state),
        stepId: getCurrentStepIdForCurrentChain(state),
        value: true,
      });
    } catch (error) {
      console.error(error);
      setFetching(false);
    }
  };

  return (
    <Col>
      <Button
        type="primary"
        onClick={generateKeypair}
        style={{marginBottom: '20px'}}
        loading={fetching}
      >
        Generate a Keypair
      </Button>
      {address && (
        <Col>
          <Space direction="vertical">
            <Alert
              message={
                <Space>
                  <Text strong>Keypair generated!</Text>
                </Space>
              }
              description={
                <div>
                  <div>
                    This is the string representation of the public key <br />
                    <Text code>{address}</Text>.
                  </div>
                  <Text>
                    Accessible (and copyable) at the top right of this page.
                  </Text>
                </div>
              }
              type="success"
              showIcon
            />
            <Alert
              message={
                <Space>
                  <Text strong>Fund your new account</Text>
                </Space>
              }
              description={
                <a
                  href={`https://faucet.avax-test.network/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Go to the faucet
                </a>
              }
              type="warning"
              showIcon
            />
          </Space>
        </Col>
      )}
    </Col>
  );
};

export default Account;
