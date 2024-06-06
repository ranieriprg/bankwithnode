(async () => {
  const inquirer = await import("inquirer");
  const chalkModule = await import("chalk");
  const fs = require("fs");

  console.log("iniciamos o account");

  // Criar o prompt
  const prompt = inquirer.createPromptModule();
  const { bgBlack, bgGreen, bgRed, bgBlue, black, white, green, red } =
    chalkModule.default;
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
        } else if (action === "Consultar saldo") {
          getAccountBalance();
        } else if (action === "Fazer deposito") {
          deposit();
        } else if (action === "Sacar") {
          toWithdraw();
        } else if (action === "Sair") {
          console.log(bgBlue("Obrigado por usar o accounts!"));
          process.exit();
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

  function deposit() {
    prompt([{ name: "accountName", message: "Digite o nome da sua conta: " }])
      .then((answers) => {
        const accountName = answers["accountName"];
        if (!checkAccount(accountName)) {
          return deposit();
        }

        prompt([
          {
            name: "amount",
            message: "Valor de depósito",
          },
        ])
          .then((answers) => {
            const amount = answers["amount"];
            addAmount(accountName, amount);

            operation();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(
        bgRed(black("Esta conta não existe, por favor selecione outra conta"))
      );
      return false;
    }
    return true;
  }

  function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);
    if (!amount || amount <= 0) {
      console.log(red("Error inesperado, tente novamente mais tarde"));
      return deposit();
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify(accountData),
      function (err) {
        console.log(err);
      }
    );
    console.log(green(`Deposito efetuado com sucesso R$${amount}`));
  }

  function getAccount(accountName) {
    const accountNameJson = fs.readFileSync(`accounts/${accountName}.json`, {
      encoding: "utf-8",
      flag: "r",
    });

    return JSON.parse(accountNameJson);
  }

  function getAccountBalance() {
    prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta",
      },
    ])
      .then((answers) => {
        const accountName = answers["accountName"];
        if (!checkAccount(accountName)) {
          return getAccountBalance();
        }
        const accountData = getAccount(accountName);
        console.log(
          bgBlue(white(`Saldo atualizado da conta: R$${accountData.balance}`))
        );
        operation()
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function toWithdraw() {
    prompt([
      {
        name: "accountName",
        message: "Digite o nome da sua conta",
      },
    ])
      .then((answers) => {
        const accountName = answers["accountName"];

        if (!checkAccount(accountName)) {
          return toWithdraw();
        }
        prompt([
          {
            name: "amount",
            message: "Digite o valor para saque: ",
          },
        ])
          .then((answers) => {
            const amount = answers["amount"];
            removeAmount(accountName, amount);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function removeAmount(accountName, amount) {
    if (!amount) {
      console.log(
        bgRed(`Ops, ocorreu um erro inesperado, tente novamente mais tarde`)
      );
      toWithdraw();
    }
    const accountData = getAccount(accountName);
    if (amount > accountData.balance) {
      console.log(
        bgRed(
          white(
            `Não foi possível finalizar sua transação! Saldo insuficiente: R$${accountData.balance}`
          )
        )
      );
      return toWithdraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
    let currentBalance = accountData.balance;
    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify(accountData),
      function (err) {
        console.log(err);
      }
    );
    console.log(
      green(
        `saque efetuado com sucesso, seu novo saldo é de: R$${currentBalance}`
      )
    );
    operation()
  }
  /////
})();
