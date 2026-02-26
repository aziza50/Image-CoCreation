import { Arizonia, Bacasime_Antique } from "next/font/google";

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
