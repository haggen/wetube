import randomColor from "random-color";
import { uniqueId } from "./unique-id";

const usernames = [
  "Akular",
  "Balu",
  "Barakuda",
  "Bars",
  "Berkut",
  "Condor",
  "Grif",
  "Kayman",
  "Kobra",
  "Leopard",
  "Lev",
  "Lis",
  "Medved",
  "Orel",
  "Pantera",
  "Rosomaha",
  "Shakal",
  "Skorpion",
  "Tarantul",
  "Taypan",
  "Tigr",
  "Vepr",
  "Victor",
  "Volk",
  "Yaguar",
  "Yastreb"
];

export const randomUser = () => ({
  id: uniqueId(),
  name: usernames[Math.floor(Math.random() * usernames.length)],
  color: randomColor().hexString()
});
