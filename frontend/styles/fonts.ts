import {
  Arizonia,
  Bacasime_Antique,
  Cormorant_Garamond,
} from "next/font/google";

const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
export { garamond };

const bacasime = Bacasime_Antique({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
export { bacasime };

const arizonia = Arizonia({
  weight: "400",
  subsets: ["latin"],
});

export { arizonia };
