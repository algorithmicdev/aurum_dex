import styled from 'styled-components';

export const StyledFooterWrapper = styled.footer`
  clear: both;
  background: transparent;
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  padding: 8px 0px;
  margin-left: auto;
  background-color:black;
  border-radius:10px;

  span {
    font-family: 'Space Grotesk', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    float: right;
    
  }

  svg {
    float: right;
  }
`;
