import { testSelector } from "./exercise_selector.ts";

try {
  testSelector();
  console.log("exercise selector validated");
} catch (error) {
  console.error(error);
  process.exit(1);
}
