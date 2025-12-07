import { readFile } from "node:fs/promises";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";

const TABLE_NAME =
  process.env.PRODUCTS_TABLE ||
  "desafio-bgc-bestsellers-products-dev";

interface ProductFromFile {
  title: string;
  price: string;
  url: string;
  paymentConditions: string;
  brand: string;
  color: string;
  material: string;
  capacity: string;
  dimensions: string;
  specialFeatures: string;
}

async function main() {
  const filePath = path.join(process.cwd(), "data", "products.json");
  console.log("Lendo arquivo:", filePath);

  const raw = await readFile(filePath, "utf8");
  const products: ProductFromFile[] = JSON.parse(raw);

  const dynamoClient = new DynamoDBClient({ region: REGION });
  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  for (let index = 0; index < products.length; index++) {
    const p = products[index];

    const item = {
      id: String(index + 1),
      ...p
    };

    console.log(`Inserindo produto: ${item.id} - ${item.title}`);

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      })
    );
  }

  console.log("\nImportação concluída para o banco de dados!");
}

main().catch((err) => {
  console.error("\nErro ao importar produtos:", err);
  process.exit(1);
});
