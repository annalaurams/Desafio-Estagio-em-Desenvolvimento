# Desafio Estágio em Desenvolvimento
Projeto desenvolvido como parte do processo seletivo de estágio em desenvolvimento, seguindo as atividades e stack definidas pela empresa.

## 📘 Sumário

- [Objetivo do Projeto](#objetivo-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura da Solução](#arquitetura-da-solução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Execução do Web Scraper](#execução-do-web-scraper)
- [Importação dos Dados no DynamoDB](#importação-dos-dados-no-dynamodb)
- [Deploy da API Serverless](#deploy-da-api-serverless)
- [Documentação da API (Swagger / OpenAPI)](#documentação-da-api-swagger--openapi)
- [Testes da API](#testes-da-api)
- [Remoção da Infraestrutura](#remoção-da-infraestrutura)
- [Retorno da Rota](#retorno-da-rota)
- [Contato](#contato)

## Objetivo do Projeto

Criar um sistema para:

1. Extrair dados dos 3 produtos mais vendidos da Amazon
2. Salvar os dados localmente 
3. Enviar os dados para o banco de dados
4. Implementar uma API REST serverless

## Tecnologias Utilizadas

| Categoria | Tecnologias |
|----------|-------------|
| **Backend / Scraper** | Node.js, TypeScript, Puppeteer, TSX |
| **AWS** | Lambda, API Gateway, DynamoDB, IAM, CloudFormation |


## Arquitetura da Solução

1. Puppeteer coleta os dados da página de mais vendidos da Amazon  
2. Os dados são salvos em `products.json` e `products.csv`  
3. O script `importToDynamo.ts` envia os dados para o DynamoDB  
4. A função Lambda `getProducts` lê do DynamoDB  
5. API Gateway expõe a rota pública GET `/products`  

## Estrutura do Projeto

```bash
/.serverless              # Serverless Framework (deploy)
data/
  ├── products.json       # Dados dos produtos em formato JSON
  └── products.csv        # Dados dos produtos em formato CSV

docs/
  └── openapi.yaml        # Documentação da API 

node_modules/             # Dependências instaladas pelo NPM

src/
  ├── handlers/
  │   └── getProducts.ts  # Handler Lambda da rota GET /products
  ├── browser.ts          # Inicializa o Puppeteer
  ├── fileExporter.ts     # Exporta dados para JSON/CSV
  ├── importToDynamo.ts   # Importa os dados para o DynamoDB
  ├── index.ts            # Fluxo principal do Web Scraper
  ├── pageController.ts   # Orquestra o processo de scraping
  └── pageScraper.ts      # Funções de extração de dados da Amazon

serverless.yml            # Configuração da infraestrutura Serverless na AWS
package.json              # Scripts e dependências do projeto
package-lock.json         # Lockfile das dependências
tsconfig.json             # Configuração do TypeScript
README.md                 # Documentação do projeto
```

## Configuração do Ambiente

### 1. Instalar dependências
```bash
npm install
```
### 2. Instalar Puppeteer

```bash
npm install --save puppeteer
```

### 3. Instalar dependências de desenvolvimento
```bash
npm install -D typescript tsx @types/node @tsconfig/node-lts serverless serverless-esbuild
```

### 4. Configurar TypeScript (tsconfig.json criado na raiz)
```bash
npx tsc --init
```

### 5. Script de execução no package.json
```json
"scripts": {
  "dev": "tsx src/index.ts",
  "deploy": "serverless deploy",
  "remove": "serverless remove",
  "logs:getProducts": "serverless logs -f getProducts"
  "import:dynamo": "tsx src/importToDynamo.ts",
}
```

## Execução do Web Scraper

Rodar o scraper:
```bash
npm run dev
```

Após a execução, serão gerados os arquivos:

- `/data/products.json`
- `/data/products.csv`


## Importação dos Dados no DynamoDB

Após gerar o JSON, execute:
```bash
npm run import:dynamo
```

## Deploy da API Serverless

Deploy completo:
```bash
npm run deploy
```

Ao final, será exibida a URL pública:

```
GET - https://m3o0ml93a4.execute-api.us-east-1.amazonaws.com/products
```

## Documentação da API (Swagger / OpenAPI)

A documentação da API foi escrita com **OpenAPI 3.0** e está disponível para visualização online:

[**Abrir Documentação Swagger**](https://editor.swagger.io/?url=https://raw.githubusercontent.com/annalaurams/Desafio-Estagio-em-Desenvolvimento/main/docs/openapi.yaml)

Arquivo fonte: [`docs/openapi.yaml`](./docs/openapi.yaml)

## Testes da API

Você pode testar a API de três maneiras:

### 1. Pelo navegador:
```
https://m3o0ml93a4.execute-api.us-east-1.amazonaws.com/products
```

### 2. Pelo terminal:
```bash
curl https://m3o0ml93a4.execute-api.us-east-1.amazonaws.com/products
```

### 3. Pelo Console AWS (Lambda)

1. Abrir **AWS Lambda**
2. Selecionar `getProducts`
3. Criar evento 
4. Testar

## Remoção da Infraestrutura

Quando terminar o desafio (para evitar custos):
```bash
npm run remove
```

Isso apaga:

- Lambda
- API Gateway
- DynamoDB
- CloudFormation Stack

## Retorno da Rota

A rota `GET /products` retorna as seguintes informações dos produtos:

- `title`
- `price`
- `url`
- `paymentConditions`
- `brand`
- `color`
- `material`
- `capacity`
- `dimensions`
- `specialFeatures`

## Contato

**Por: Anna Laura Moura Santana**

[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:nalauramoura@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/annalaurams)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/annalaurams)
