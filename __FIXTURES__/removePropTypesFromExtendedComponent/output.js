import styled from 'styled-components';
import PropTypes from 'prop-types';

const Box = styled.div``;

const BaseBox = Box.extend`
  color: ${p => p.color};
`;

export default BaseBox;
