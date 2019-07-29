import Hashids from "hashids";

const hashids = new Hashids();

export const uniqueId = () => {
  return hashids.encode(Date.now());
};
