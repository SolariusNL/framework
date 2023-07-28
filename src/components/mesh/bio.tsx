import styled from "styled-components";

type BioMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const BioMesh = styled.div<BioMeshProps>`
  background-color: #9e99ff;
  background-image: radial-gradient(
      at 88% 64%,
      hsla(27, 93%, 65%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 4% 43%, hsla(356, 98%, 65%, 1) 0px, transparent 50%),
    radial-gradient(at 32% 12%, hsla(15, 74%, 78%, 1) 0px, transparent 50%),
    radial-gradient(at 6% 45%, hsla(75, 76%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 38% 42%, hsla(13, 77%, 61%, 1) 0px, transparent 50%),
    radial-gradient(at 74% 46%, hsla(139, 73%, 66%, 1) 0px, transparent 50%),
    radial-gradient(at 30% 55%, hsla(11, 74%, 68%, 1) 0px, transparent 50%);
`;

export default BioMesh;
