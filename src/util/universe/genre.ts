import { GameGenre } from "@prisma/client";

export const genreMap: { [key in GameGenre]: string } = {
  "ACTION": "Action",
  "ADVENTURE": "Adventure",
  "RPG": "RPG",
  "SIMULATION": "Simulation",
  "STRATEGY": "Strategy",
  "SPORTS": "Sports",
  "PUZZLE": "Puzzle",
  "RACING": "Racing",
  "FANTASY": "Fantasy",
  "MMO": "MMO",
  "SHOOTER": "Shooter",
  "ROLE_PLAYING": "Role Playing",
  "HORROR": "Horror",
  "OTHER": "Other",
};

function getGenreText(genre: GameGenre) {
  return genreMap[genre];
}

export {
  getGenreText,
};