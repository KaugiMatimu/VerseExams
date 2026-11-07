import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function askSecret(label: string) {
  if (!input.isTTY || !input.setRawMode) {
    const prompt = createInterface({ input, output });
    try {
      return await prompt.question(label);
    } finally {
      prompt.close();
    }
  }

  output.write(label);
  input.setRawMode(true);
  input.setEncoding("utf8");
  input.resume();
  return new Promise<string>((resolve, reject) => {
    let value = "";
    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          finish();
          reject(new Error("Password entry cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          output.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          if (value.length) {
            value = value.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }
        if (character >= " ") {
          value += character;
          output.write("*");
        }
      }
    };
    const finish = () => {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
    };
    input.on("data", onData);
  });
}

async function main() {
  const password = await askSecret("Choose an admin password (minimum 12 characters): ");
  const confirmation = await askSecret("Confirm the password: ");
  if (password.length < 12) throw new Error("Use at least 12 characters.");
  if (Buffer.byteLength(password, "utf8") > 72) throw new Error("Use at most 72 UTF-8 bytes for bcrypt.");
  if (password !== confirmation) throw new Error("The passwords do not match.");
  const hash = await bcrypt.hash(password, 12);
  console.log("\nCopy this hash into ADMIN_PASSWORD_HASH in your .env file:\n");
  console.log(hash);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Could not create the password hash.");
  process.exitCode = 1;
});
