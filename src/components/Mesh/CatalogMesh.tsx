import styled from "styled-components";

type CatalogMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const CatalogMesh = styled.div<CatalogMeshProps>`
  background-color: #ff99ad;
  background-image: radial-gradient(
      at 38% 69%,
      hsla(289, 60%, 79%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 9% 31%, hsla(248, 90%, 77%, 1) 0px, transparent 50%),
    radial-gradient(at 49% 9%, hsla(302, 78%, 74%, 1) 0px, transparent 50%),
    radial-gradient(at 28% 48%, hsla(257, 95%, 76%, 1) 0px, transparent 50%),
    radial-gradient(at 35% 17%, hsla(231, 96%, 68%, 1) 0px, transparent 50%),
    radial-gradient(at 21% 36%, hsla(310, 92%, 63%, 1) 0px, transparent 50%),
    radial-gradient(at 60% 42%, hsla(250, 81%, 68%, 1) 0px, transparent 50%);
`;

export default CatalogMesh;
