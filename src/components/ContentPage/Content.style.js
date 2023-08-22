import styled from 'styled-components';

export const WrapperContent = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
  min-height: 780px;
`;

export const WrapperContentLeft = styled.div`
  display: flex;
  flex: 1;

  min-width: 1020px;
  flex-direction: column;

  @media (min-width: 1500px) {
    width: 80%;
  }
  @media (min-width: 1650px) {
    width: 70%;
  }
`;

export const WrapperContentChart = styled.div`
  display: flex;
`;
export const WrapperOrderRight = styled.div`
  display: flex;
  flex: 1;
  min-width: 420px;
`;

export const WrapperContentRight = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  z-index: 1;
  left:0;
  @media (max-width: 1440px) {
    width: 250px;
    min-width: 250px;
  }
  @media (min-width: 1500px) {
    width: 20%;
  }
  @media (min-width: 1650px) {
    width: 30%;
  }
`;

export const WrapperContentOrder = styled.div`
  width: 100%;
  min-height: 380px;
  height: 100%;
  display: flex;
`;
