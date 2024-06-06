(async () => {
  const inquirer = await import("inquirer");
  const chalkModule = await import("chalk");
  const fs = require("fs");

  console.log("iniciamos o account");

  // Criar o prompt
  const prompt = inquirer.createPromptModule();
  const { bgGreen, bgRed, bgBlue, black, green } = chalkModule.default;
  operation();

  function operation() {
    prompt([
      {
        type: "list",
        name: "action",
        message: "O que deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Fazer deposito",
          "Sacar",
          "Sair",
        ],
      },
    ])
      .then((answers) => {
        const action = answers["action"];
        if (action === "Criar conta") {
          createAccount();
        } else if (action === "Consultar Saldo") {
        } else if (action === "Fazer deposito") {
        } else if (action === "Sacar") {
        } else if (action === "Sair") {
            console.log(bgBlue('Obrigado por usar o accounts!'))
            process.exit()
        }
      })
      .catch((err) => {
        console.log("Erro ao tentar acessar a sua conta", err);
      });
  }

  function createAccount() {
    console.log(bgGreen(black(`Parabéns por escolher o nosso banco!`)));
    console.log(green(`Escolha as opções da sua conta a seguir.`));

    buildAccount();
    return;
  }

  function buildAccount() {
    prompt([
      {
        name: "accountName",
        message: "Digite o nome para sua conta: ",
      },
    ])
      .then((answers) => {
        const accountName = answers["accountName"];
        console.info(accountName);

        if (!fs.existsSync("accounts")) {
          fs.mkdirSync("accounts");
        }
        if (fs.existsSync(`accounts/${accountName}.json`)) {
          console.log(bgRed(black("este nome ja existe, escolha outro nome")));
          buildAccount();
          return;
        }
        fs.writeFileSync(
          `accounts/${accountName}.json`,
          '{"balance": 0}',
          function (err) {
            console.log("ERRROR: ", err);
          }
        );
        console.log(green("Parabens, sua conta foi criada com sucesso..."));
        operation();
      })
      .catch((err) => {
        console.log("failed", err);
      });
  }
})();
