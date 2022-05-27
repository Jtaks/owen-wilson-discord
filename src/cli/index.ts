import { program } from "commander";

program.option(
  "-p, --production",
  "Production indicates non-Guild application commands"
);

program
  .command("register [command...]")
  .description("Register given commands. Register all if omitted.")
  .action((commands) => {
    console.log(`todo: remove commands ${commands}`);
  });

program
  .command("remove [command...]")
  .description("Remove given commands. Remove all if omitted")
  .action((commands) => {
    console.log(`todo: remove commands ${commands}`);
  });

program.parse();
