import styled from 'styled-components';
import PropTypes from 'prop-types';

const Test = styled.div`
  color: ${p => p.color};
`;

const Test2 = styled(Test)`
  color: ${p => p.color};
`;

export default Test;
