import { useState, useEffect } from "react";
import randomColor from "random-color";
import { uniqueId } from "../lib/unique-id";

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

const localStorageProfileKey = "profile";

export const useCurrentUser = () => {
  const profile = localStorage.getItem(localStorageProfileKey);

  const [currentUser, setCurrentUser] = useState(
    profile ? JSON.parse(profile) : randomUser()
  );

  useEffect(() => {
    localStorage.setItem(localStorageProfileKey, JSON.stringify(currentUser));
  }, [currentUser]);

  return [currentUser, setCurrentUser];
};
