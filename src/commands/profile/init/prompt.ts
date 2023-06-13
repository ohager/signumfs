import inquirer from "inquirer";
interface ProfileAnswers {
  seed: string;
  node: string;
  pin: string;
  confirmedPin: string;
}

let pinRetrialCount = 0;

export const promptProfile = async () => {
  return inquirer.prompt<ProfileAnswers>([
    {
      type: "password",
      message:
        "Please enter a personal PIN first to secure your account recovery phrase:",
      name: "pin",
    },
    {
      type: "password",
      message: "Please confirm your PIN:",
      name: "confirmedPin",
      validate(input: any, answers: ProfileAnswers) {
        const matchesPin = input === answers.pin;
        if (matchesPin) return true;

        ++pinRetrialCount;
        if (pinRetrialCount >= 3) {
          setTimeout(() => {
            process.exit(-1);
          }, 500);
          return "Too many trials - Stopping";
        }
        return "PINs do not match";
      },
    },
    {
      type: "input",
      message: "Please enter your preferred node:",
      default: "http://localhost:6876",
      name: "node",
    },
    {
      type: "input",
      message: "Please enter your passphrase:",
      name: "seed",
    },
  ]);
};
