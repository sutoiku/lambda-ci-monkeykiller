# lambda MonkeyKiller

Kills an AWS instance based on a tag periodically. Monkey is a friendly reference
to Netflix Simian Army.

### Environment variables
 - `MAX_AGE_DAYS` : if the instance is older than this, it will be terminated,
no matter what.
 - `TAG_TO_KILL` : Value of the `Name` taht will be used to filter the Instances
 to consider for termination.
 - `ODDS` : The designated instances will not be destroyed everytime. If `ODDS`
 is set to 5, it will have 20% chances to be terminated. It `ODDS` is set to 1,
 the machine will have 100% chances to be terminated.

### Deployment
`grunt` transformes the ES6 syntaxes into ES5 with `babel` prior to deployment,
as Lambda only supports Node 6 at this time.

### Scheduling
Scheduling can be achieved using AWS Cloudwatch events.

### Testing locally
`DEBUG=* MAX_AGE_DAYS=5 TAG_TO_KILL=my-target ODDS=5 grunt lambda_invoke`

### Credentials
Local credentials (used for deployment) and Lambda credentials (used for
execution) must be provided either via environment variables or IAM profiles.

### Caveats
- Instead of `Name`, a specific tag should be used
- This terminates only 1 machine. It should be able to handle the case of
 multiple machines returned by the `listInstances()` call.
