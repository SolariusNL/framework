import styled from "styled-components";

type FollowMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const FollowMesh = styled.div<FollowMeshProps>`
  background-color: #ff99e2;
  background-image: radial-gradient(
      at 67% 41%,
      hsla(21, 70%, 62%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 99% 72%, hsla(29, 84%, 66%, 1) 0px, transparent 50%),
    radial-gradient(at 26% 40%, hsla(279, 91%, 66%, 1) 0px, transparent 50%),
    radial-gradient(at 5% 45%, hsla(292, 62%, 68%, 1) 0px, transparent 50%),
    radial-gradient(at 70% 90%, hsla(43, 88%, 61%, 1) 0px, transparent 50%),
    radial-gradient(at 55% 63%, hsla(356, 98%, 74%, 1) 0px, transparent 50%),
    radial-gradient(at 4% 33%, hsla(342, 74%, 65%, 1) 0px, transparent 50%);
`;

export default FollowMesh;
