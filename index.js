#!/usr/bin/env node

const { Command } = require("commander");
const programm = new Command();
const fs = require("fs");
const prettier = require("prettier");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const rl = readline.createInterface({ input, output });

programm.version("1.0.0").description("Code formatter.");

programm
  .command("format <pathtofile>")
  .option("--trailingcomma <trailingcomma>", "Trailing comma option")
  .option("--tabwidth <tabwidth>", "Tab width")
  .option("--semi <semi>", "Semicolons option")
  .option("--singlequote <singlequote>", "Single quote option")
  .option("--preview", "View changes before submit")
  .alias("f")
  .description("Format code in file")
  .action(async (pathto, cmd) => {
    if (
      !["all", "es5", "none"].includes(cmd.trailingcomma) &&
      cmd.trailingcomma
    ) {
      console.log(
        `Invalid trailingComma value. Expected "all", "es5" or "none", but received "${cmd.trailingcomma}".`
      );
      rl.close();
      return;
    }

    if (isNaN(parseInt(cmd.tabwidth)) && cmd.tabwidth) {
      console.log("Invalid tabWidth value. Expected an integer value.");
      rl.close();
      return;
    }

    fs.stat(pathto, async function (err, stats) {
      const config = {
        trailingComma: cmd.trailingcomma ? cmd.trailingcomma : "es5",
        tabWidth: cmd.tabwidth ? Number(cmd.tabwidth) : 4,
        semi: cmd.semi ? true : false,
        singleQuote: cmd.singlequote == "false" ? false : true,
        parser: "babel",
      };

      if (stats == undefined) {
        console.log("Bad file path");
        rl.close();
        return;
      }

      if (stats.isFile()) {
        const fileContent = fs.readFileSync(pathto, "utf-8");
        const formatedCode = await prettier.format(fileContent, config);
        if (cmd.preview) {
          console.log(formatedCode);
          const answer = await rl.question(
            'Send "Y" to cofnirm changes. Any other key will cancel the changes.\n'
          );
          if (answer == "Y" || answer == "") {
            fs.writeFileSync(pathto, formatedCode);
          }
        } else fs.writeFileSync(pathto, formatedCode);
        rl.close();
      }
      if (stats.isDirectory()) {
        const option = {
          withFileTypes: true,
        };

        fs.readdir(pathto, option, async (err, files) => {
          for (let file of files) {
            if (file.isFile()) {
              if (file.name.substr(file.name.length - 3) == ".js") {
                const pathtofile = file.path + "\\" + file.name;
                const fileContent = fs.readFileSync(pathtofile, "utf-8");
                const formatedCode = await prettier.format(fileContent, config);
                if (cmd.preview) {
                  console.log(formatedCode);
                  const answer = await rl.question(
                    'Send "Y" to cofnirm changes. Any other key will cancel the changes.\n'
                  );
                  if (answer == "Y" || answer == "") {
                    fs.writeFileSync(pathto, formatedCode);
                    rl.close();
                  }
                } else fs.writeFileSync(pathtofile, formatedCode);
                rl.close();
              }
            }
          }
        });
      }
    });
  });

programm.parse(process.argv);
