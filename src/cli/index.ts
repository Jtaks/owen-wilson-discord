import { program } from "commander";
import { registerCommands, removeOldCommands } from "../lib/command-manager";

program
  .option(
    "-p, --production",
    "Production indicates non-Guild application commands. This overrides the NODE_ENV environment variable."
  )
  .hook("preAction", () => {
    if (program.opts().production) {
      process.env.NODE_ENV = "production";
    }
  });

program
  .command("register")
  .description("Register all commands.")
  .action(() => {
    registerCommands();
  });

program
  .command("remove")
  .description("Remove old commands")
  .action(() => {
    // TODO: Remove all guild commands
    removeOldCommands();
  });

program.parse();
