import styled from "styled-components";

type LikeGameMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const LikeGameMesh = styled.div<LikeGameMeshProps>`
  background-color: #ffc599;
  background-image: radial-gradient(
      at 67% 19%,
      hsla(180, 72%, 61%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 45% 23%, hsla(250, 61%, 79%, 1) 0px, transparent 50%),
    radial-gradient(at 19% 65%, hsla(199, 81%, 74%, 1) 0px, transparent 50%),
    radial-gradient(at 96% 42%, hsla(174, 65%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 66% 13%, hsla(118, 86%, 71%, 1) 0px, transparent 50%),
    radial-gradient(at 31% 5%, hsla(112, 81%, 65%, 1) 0px, transparent 50%),
    radial-gradient(at 55% 97%, hsla(3, 62%, 71%, 1) 0px, transparent 50%);
`;

export default LikeGameMesh;
