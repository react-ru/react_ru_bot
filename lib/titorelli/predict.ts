import fetch from "cross-fetch";
import type { Prediction, UnlabeledExample } from "./types";

export const predict = async ({ text }: UnlabeledExample) => {
  const url = new URL("/react_ru/predict", process.env["TITORELLI_HOST"]);
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  });
  const data = (await resp.json()) as Prediction;

  return data;
};
