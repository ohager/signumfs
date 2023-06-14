import inquirer from "inquirer";

interface Answers {
  confirmed: boolean;
}

export const promptConfirm = async (question?: string) => {
  const answer = await inquirer.prompt<Answers>([
    {
      type: "confirm",
      message: question ?? "Are you sure?",
      name: "confirmed",
    },
  ]);

  return answer.confirmed;
};
