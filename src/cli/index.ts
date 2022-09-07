import { program } from "commander";
import {
  registerCommands,
  removeApplicationGuildCommands,
  removeOldApplicationCommands,
} from "../lib/command-manager";

program.name("owen-wilson-cli");

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
    removeOldApplicationCommands();
  });

program
  .command("remove-guild")
  .description("Remove all guild commands")
  .action(() => {
    removeApplicationGuildCommands();
  });

program.parse();
