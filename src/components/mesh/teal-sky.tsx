import styled from "styled-components";

type TealSkyMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const TealSkyMesh = styled.div<TealSkyMeshProps>`
  background-color: #99d3ff;
  background-image: radial-gradient(
      at 5% 17%,
      hsla(89, 68%, 74%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 5% 83%, hsla(318, 66%, 76%, 1) 0px, transparent 50%),
    radial-gradient(at 34% 36%, hsla(110, 88%, 66%, 1) 0px, transparent 50%),
    radial-gradient(at 33% 2%, hsla(112, 78%, 70%, 1) 0px, transparent 50%),
    radial-gradient(at 17% 99%, hsla(179, 79%, 75%, 1) 0px, transparent 50%),
    radial-gradient(at 39% 35%, hsla(9, 68%, 66%, 1) 0px, transparent 50%),
    radial-gradient(at 23% 17%, hsla(124, 91%, 64%, 1) 0px, transparent 50%);
`;

export default TealSkyMesh;
