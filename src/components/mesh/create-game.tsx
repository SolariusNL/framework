import styled from "styled-components";

type CreateGameMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const CreateGameMesh = styled.div<CreateGameMeshProps>`
  background-color: #99adff;
  background-image: radial-gradient(
      at 69% 5%,
      hsla(196, 60%, 63%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 24% 80%, hsla(310, 82%, 61%, 1) 0px, transparent 50%),
    radial-gradient(at 2% 60%, hsla(347, 66%, 70%, 1) 0px, transparent 50%),
    radial-gradient(at 13% 25%, hsla(356, 77%, 61%, 1) 0px, transparent 50%),
    radial-gradient(at 95% 78%, hsla(215, 90%, 62%, 1) 0px, transparent 50%),
    radial-gradient(at 23% 92%, hsla(193, 75%, 74%, 1) 0px, transparent 50%),
    radial-gradient(at 22% 43%, hsla(282, 75%, 62%, 1) 0px, transparent 50%);
`;

export default CreateGameMesh;
