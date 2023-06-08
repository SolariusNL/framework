import styled from "styled-components";

type ReferMeshProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const ReferMesh = styled.div<ReferMeshProps>`
  background-color: #ff99f0;
  background-image: radial-gradient(
      at 30% 11%,
      hsla(84, 76%, 66%, 1) 0px,
      transparent 50%
    ),
    radial-gradient(at 17% 61%, hsla(137, 82%, 76%, 1) 0px, transparent 50%),
    radial-gradient(at 40% 65%, hsla(135, 75%, 77%, 1) 0px, transparent 50%),
    radial-gradient(at 52% 37%, hsla(343, 60%, 71%, 1) 0px, transparent 50%),
    radial-gradient(at 88% 46%, hsla(200, 66%, 63%, 1) 0px, transparent 50%),
    radial-gradient(at 58% 91%, hsla(214, 64%, 73%, 1) 0px, transparent 50%),
    radial-gradient(at 10% 96%, hsla(214, 70%, 68%, 1) 0px, transparent 50%);
`;

export default ReferMesh;
