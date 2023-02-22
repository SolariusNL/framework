const { PrismaClient } = require("@prisma/client");

function generateRandomIpsum() {
  const ipsums = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    "Nullam ac tellus commodo tortor aliquam tristique. Quisque semper dui auctor, condimentum lectus at, sagittis est. Nam commodo enim vel elit sollicitudin bibendum.",
    "Pellentesque aliquet urna eu ex convallis, vitae vestibulum odio ullamcorper. Etiam vitae mi quis purus dictum luctus eget id magna. Aliquam scelerisque libero quis nunc bibendum commodo.",
    "Donec ultrices quam et facilisis dictum. Vestibulum euismod lectus non mi commodo dapibus. Sed gravida ante in sapien dignissim vestibulum.",
  ];
  const randomIndex = Math.floor(Math.random() * ipsums.length);
  const randomIpsum = ipsums[randomIndex];
  const sentences = randomIpsum.split(". ");
  return `${sentences[0]}. ${sentences[1]}. ${sentences[2]}.`;
}

const teamsToCreate = 30;
const client = new PrismaClient();

const teamNames = [
  "Fire Dragons",
  "Thunderbolts",
  "Ice Sharks",
  "Lightning Wolves",
  "Iron Titans",
  "Sky Hawks",
  "Mountain Lions",
  "Desert Scorpions",
  "Jungle Panthers",
  "Ocean Waves",
  "Earth Warriors",
  "Night Owls",
  "Space Rangers",
  "Forest Foxes",
  "River Rats",
  "Rock Hounds",
  "Shadow Cats",
  "Wind Riders",
  "Sand Storm",
  "Ghost Riders",
  "Sun Devils",
  "Arctic Foxes",
  "Blaze Eagles",
  "Storm Troopers",
  "Golden Eagles",
  "Dark Knights",
  "Thunder Hawks",
  "Aqua Sharks",
  "Moon Wolves",
  "Crimson Dragons",
];

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${randomIndex}/300/300`;
};

for (let i = 0; i < teamsToCreate; i++) {
  const teamName = teamNames[i];
  const teamDescription = generateRandomIpsum();
  const teamImage = getRandomImage();
  const team = client.team
    .create({
      data: {
        name: teamName,
        description: teamDescription,
        iconUri: teamImage,
        owner: {
          connect: {
            id: 1,
          },
        },
        location: "United States",
      },
    })
    .then((team) => {
      console.log(team);
    });
}
