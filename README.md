# VoiceFoundry Development Project

This is a project creates a stack using AWS CDK wich implements an Amazon connect ContactFlow with a Lambda function for generating vanity numbers and store them into DynamoDB table and returns up to three results to the contact flow.

## Deploy
Create fie .env with content like .env.example and put your `Instance ARN` from Amazon Connect.

Run `cdk bootstrap` command
Run `cdk deploy` command

If you want to generate CloudFormation template
Run `cdk synth` command 

After deploy is ready associate the Lambda with Amazon Connect in the console.
(TODO - Must be done with CDK)

You can test the contact flow with this number:
+1 833-518-0681

## Lambda description 
Since it is better to return some existing words, I decided to look up an array or dictionary with English words and came across the `an-array-of-english-words` package and decided to use it to generate an object with predefined values by writing down all the words found for a given sequence of numbers, for example:

...
"943359": ["wheely","widely","wifely"],
"2665": ["amok","bonk","book","bool","conk","cook","cool"],
...

I decided to use an object instead of an array, because accessing a key value from an object is a much faster operation than crawling an array, which will make the function fast enough for the Contact Flow.
Words with a length of 3 to 7 characters have been added to the object.
For the best result, take the longest sequence of numbers that does not contain 0 or 1 and can be replaced with a word from the object. The longest series of numbers is replaced by the words found for it in the object.

For example, for the phone number `+1 078 833 6811` the following will be generated:

  "VanityNumber1": "+1 0 student 11",
  "VanityNumber2": "+1 0 stude 6811",
  "VanityNumber3": "+1 0 stuff 6811",
  "VanityNumber4": "+1 0788 dent 11",
  "VanityNumber5": "+1 0788 fent 11"

The country code is currently included, but it would be good to remove it when generating the results, but for this purpose it must be separated in some way from the incoming phone number itself. One of the implementations can be through a file containing all possible country codes and matching checks. Then remove it from the series that will be used to search for a matching word. Once a matching word is found, concatenate the country code with the generated number and word.

## Contact Flow description
I made Contact Flow manually and then used the command
`aws connect describe-contact-flow` so I can integrate it in the CDK. Maybe there is a way to do it through the CDK, but I will have to do research. It is a good idea to have error monitoring but I think that AWS has proper tools for this purpose.

While I was implementing the Lambda feature in Contact Flow, it used a lot of memory and CPU time, so Contact Flow didn't work. That's why I decided to implement the Lmbda function with a pre-prepared object instead of generating from the beginning each time.

## TODOs
- Make Lambda function for reading results from DynamoDB.
- Restrict access to the Lambda function only to the table it uses, not to the entire DynamoDB.
Some mechanism can be applied to cache already called callers so that they do not have to be regenerated.
- Create an API that returns the results saved in the database.
In the case of API implementation, a research should be done on possible tools that will improve security and alleviate possible high traffic to the API. At first glance, these are AWS WAF, CloudFront, but since I have not used AWS so far, I have to do a separate research for each of them.
- Make a WEB App with React to visualize the results of the API.
