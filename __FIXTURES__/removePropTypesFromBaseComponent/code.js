import styled from "styled-components";
import PropTypes from "prop-types";

const Test = styled.div`
  color: ${p => p.color};
`;

Test.propTypes = {
  color: PropTypes.string.isRequired
};

export default Test;
