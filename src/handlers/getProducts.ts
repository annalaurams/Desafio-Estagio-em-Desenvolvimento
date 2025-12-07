import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResultV2 } from "aws-lambda";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.PRODUCTS_TABLE!;

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  try {
    const data = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    );

    const items = data.Items ?? [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(items)
    };
  } catch (error) {
    console.error("Erro ao buscar produtos no DynamoDB:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Erro interno ao buscar produtos"
      })
    };
  }
};
