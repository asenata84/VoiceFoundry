import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as connect from 'aws-cdk-lib/aws-connect';

export class VoiceFoundryStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'VanityNumbers', {
      partitionKey: { name: 'phone', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER }
    });

    // AWS Lambda for generating vanity numbers
    const generateVanityNumbersLambda = new lambda.Function(this, 'GenerateVanityNumbers', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resources/Lamda.zip'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    // Grant the lambda role read/write permissions to the table
    table.grantReadWriteData(generateVanityNumbersLambda);

    // Connect ContactFlow
    new connect.CfnContactFlow(this, "VanityNumbersContactFlow", {
      instanceArn: "arn:aws:connect:us-east-1:853451806246:instance/16bb46af-2c14-4955-b2a8-2a1f86c7ea3e",
      name: "VoiceFoundry ContactFlow",
      type: "CONTACT_FLOW",
      state: "ACTIVE",
      content: `{\"Version\":\"2019-10-30\",\"StartAction\":\"20f6f82e-bc89-450b-befb-6e4775ade5a2\",\"Metadata\":{\"entryPointPosition\":{\"x\":32,\"y\":59},\"snapToGrid\":false,\"ActionMetadata\":{\"b69f5621-117f-40ca-9ff9-bfcaefc70686\":{\"position\":{\"x\":488,\"y\":400},\"useDynamic\":false},\"3bde8caf-e0ac-4151-9b67-955636eb4c7a\":{\"position\":{\"x\":892,\"y\":227}},\"20f6f82e-bc89-450b-befb-6e4775ade5a2\":{\"position\":{\"x\":195,\"y\":184},\"dynamicMetadata\":{},\"useDynamic\":false},\"b1f15b95-d8fe-4d44-b6a0-217f6471ced1\":{\"position\":{\"x\":546,\"y\":42},\"useDynamic\":false}}},\"Actions\":[{\"Identifier\":\"b69f5621-117f-40ca-9ff9-bfcaefc70686\",\"Parameters\":{\"Text\":\"Please try again later\"},\"Transitions\":{\"NextAction\":\"3bde8caf-e0ac-4151-9b67-955636eb4c7a\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"MessageParticipant\"},{\"Identifier\":\"3bde8caf-e0ac-4151-9b67-955636eb4c7a\",\"Type\":\"DisconnectParticipant\",\"Parameters\":{},\"Transitions\":{}},{\"Identifier\":\"20f6f82e-bc89-450b-befb-6e4775ade5a2\",\"Parameters\":{\"LambdaFunctionARN\":\"${generateVanityNumbersLambda.functionArn}\",\"InvocationTimeLimitSeconds\":\"3\"},\"Transitions\":{\"NextAction\":\"b1f15b95-d8fe-4d44-b6a0-217f6471ced1\",\"Errors\":[{\"NextAction\":\"b69f5621-117f-40ca-9ff9-bfcaefc70686\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"InvokeLambdaFunction\"},{\"Identifier\":\"b1f15b95-d8fe-4d44-b6a0-217f6471ced1\",\"Parameters\":{\"Text\":\"Generated numbers are:\\n$.External.VanityNumber1 ,\\n$.External.VanityNumber2 ,\\n$.External.VanityNumber3 .\"},\"Transitions\":{\"NextAction\":\"3bde8caf-e0ac-4151-9b67-955636eb4c7a\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"MessageParticipant\"}]}`,
      description: "Contact flow for vanity numbers",
    });
  }
}
