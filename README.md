# Tribal Wars 2 Auto Farm
Farm todas aldeias abandonadas ao redor de suas aldeias automaticamente.

## Como compilar o script

Instale [Node.js](https://nodejs.org/).

Então:

```bash
$ git clone https://mafrazzrafael@gitlab.com/mafrazzrafael/tw2autofarm.git
$ cd tw2autofarm
$ npm install
$ npm install -g grunt-cli
$ grunt
```

O script será gerado na pasta `/dist`.

## Configurações

O script utiliza **predefinições** e **grupos** como configurações.

### Predefinição .farm

Crie uma predefinição nomeada **.farm**, especifique a quantidade de
unidades. Essa predefinição será usada para enviar todos comandos pelo script.

### Grupo .ignore

Crie um grupo nomeado **.ignore** e o adicione em todas aldeias que você
não quer se seja usada pelo script.

Funciona tanto nas aldeias alvos (abandonadas) quanto nas suas próprias aldeias.

### Customização dos nomes

Você pode alterar os nomes dos grupos e definições usadas pelo script, desde que
especifique-os nas configurações *in-line* como demonstrado abaixo.

## Configurações internas

- **radius** distância máxima dos alvos (campos). *padrão: 10*
- **interval** intervalo entre cada comando (segundos). *padrão: 3*
- **presetName** nome da predefinição que será utilizada para enviar os comandos. *padrão: .farm*
- **groupIgnore** nome do grupo que será usado para identificar as aldeias não serão utilizadas pelo script. *padrão: .ignore*
- **currentOnly** faz com que o script utilize apenas a aldeia selecionada para enviar os comandos. *padrão: false*

## Como rodar o script

Abra o console do navegador (Ctrl+Shift+J) na página do jogo,
copie o conteúdo do script `dist/tw2autofarm.js`, cole no Console e execute.

```js
var autofarm = new AutoFarm({ /* settings */ });

autofarm.ready(function () {
    autofarm.start();
});
```
